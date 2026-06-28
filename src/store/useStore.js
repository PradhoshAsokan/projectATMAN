import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Helper to generate 30 days of mock progress data
const generateMockLogs = () => {
  const logs = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayProgress = 30 - i;
    const baseWeight = 102.5 - (dayProgress * 0.14); // gradually lose weight
    const randomWeightFluc = Math.sin(dayProgress * 0.7) * 0.3;
    const weight = parseFloat((baseWeight + randomWeightFluc).toFixed(1));
    
    const steps = Math.floor(7800 + Math.sin(dayProgress * 1.2) * 1500 + Math.cos(dayProgress * 0.6) * 1000);
    const calories = Math.floor(2350 + Math.sin(dayProgress * 2) * 200 + Math.cos(dayProgress) * 100);
    const water = parseFloat((2.8 + Math.sin(dayProgress * 0.8) * 0.8).toFixed(1));
    
    logs.push({
      id: `mock-log-${i}`,
      date: dateStr,
      weight,
      steps,
      calories_consumed: calories,
      water_intake_liters: water
    });
  }
  return logs;
}

const defaultMetrics = {
  start_date: '2026-06-01', // month 1 start, makes user tenure ~27 days
  starting_weight: 102.5,
  goal_weight: 64.5,
  height: 178
};

export const useStore = create((set, get) => ({
  user: null,
  session: null,
  userMetrics: defaultMetrics,
  dailyLogs: [],
  workoutsLogged: [],
  loading: true,
  error: null,
  isDemoMode: !isSupabaseConfigured,
  isResettingPassword: false, // Recovery state triggered by email redirect link

  // Initialize Auth & App Data
  initApp: async () => {
    set({ loading: true, error: null });
    
    if (!isSupabaseConfigured) {
      // Demo Mode Initializer
      const cachedUser = localStorage.getItem('demo_user');
      const cachedMetrics = localStorage.getItem('demo_metrics');
      const cachedLogs = localStorage.getItem('demo_logs');
      const cachedWorkouts = localStorage.getItem('demo_workouts');

      if (cachedUser) {
        set({ 
          user: JSON.parse(cachedUser),
          userMetrics: cachedMetrics ? JSON.parse(cachedMetrics) : defaultMetrics,
          dailyLogs: cachedLogs ? JSON.parse(cachedLogs) : generateMockLogs(),
          workoutsLogged: cachedWorkouts ? JSON.parse(cachedWorkouts) : [],
          isDemoMode: true
        });
      } else {
        set({ 
          user: null,
          dailyLogs: generateMockLogs(),
          workoutsLogged: [],
          isDemoMode: true
        });
      }
      set({ loading: false });
      return;
    }

    try {
      // Live Supabase Mode - Listen to Auth State Changes
      // We rely on the initial callback run of onAuthStateChange to set the session state
      let initialCheckDone = false;

      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Open password reset modal when coming back from email verification recovery redirect
          set({ isResettingPassword: true });
        }

        if (currentSession) {
          set({ session: currentSession, user: currentSession.user });
          try {
            await Promise.all([
              get().fetchMetrics(currentSession.user.id),
              get().fetchDailyLogs(currentSession.user.id),
              get().fetchWorkouts(currentSession.user.id)
            ]);
          } catch (e) {
            console.error("Error loading user profile telemetry:", e);
          }
        } else {
          // Prevent clearing resetting state if we are redirecting to password reset
          if (event !== 'SIGNED_OUT') {
            set({ user: null, session: null, dailyLogs: [], workoutsLogged: [] });
          }
        }

        if (!initialCheckDone) {
          initialCheckDone = true;
          set({ loading: false });
        }
      });

    } catch (err) {
      console.error("Auth initialization error:", err);
      set({ error: err.message, loading: false });
    }
  },

  // Auth: Login
  login: async (email, password) => {
    set({ loading: true, error: null });
    
    if (!isSupabaseConfigured) {
      // Mock Login
      const sanitizedEmail = email ? email.trim().toLowerCase() : ''
      const accounts = JSON.parse(localStorage.getItem('demo_accounts') || '{}')
      
      const isDefaultMock = sanitizedEmail === 'atman@fitness.com' && password === 'password123'
      const isCustomMock = accounts[sanitizedEmail] && accounts[sanitizedEmail] === password

      if (isDefaultMock || isCustomMock) {
        const mockUser = { id: `mock-user-${sanitizedEmail}`, email: sanitizedEmail };
        localStorage.setItem('demo_user', JSON.stringify(mockUser));
        
        // Cache user metrics or logs if not exists
        if (!localStorage.getItem('demo_metrics')) {
          localStorage.setItem('demo_metrics', JSON.stringify(defaultMetrics));
        }
        if (!localStorage.getItem('demo_logs')) {
          localStorage.setItem('demo_logs', JSON.stringify(generateMockLogs()));
        }
        
        set({ 
          user: mockUser, 
          userMetrics: JSON.parse(localStorage.getItem('demo_metrics')) || defaultMetrics,
          dailyLogs: JSON.parse(localStorage.getItem('demo_logs')) || generateMockLogs(),
          workoutsLogged: JSON.parse(localStorage.getItem('demo_workouts')) || []
        });
        set({ loading: false });
        return { success: true };
      } else {
        set({ loading: false, error: 'Invalid credentials. Hint: use atman@fitness.com & password123' });
        return { success: false, error: 'Invalid credentials' };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Pre-load all user datasets in parallel BEFORE we trigger navigation to /home
      await Promise.all([
        get().fetchMetrics(data.user.id),
        get().fetchDailyLogs(data.user.id),
        get().fetchWorkouts(data.user.id)
      ]);

      set({ user: data.user, session: data.session, loading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // Auth: Sign Up (User Creation with Verification)
  signUp: async (email, password) => {
    set({ loading: true, error: null });

    if (!isSupabaseConfigured) {
      // Mock Sign Up
      const sanitizedEmail = email ? email.trim().toLowerCase() : ''
      const accounts = JSON.parse(localStorage.getItem('demo_accounts') || '{}')
      
      if (sanitizedEmail === 'atman@fitness.com' || accounts[sanitizedEmail]) {
        set({ loading: false, error: 'Identity already registered in console.' });
        return { success: false, error: 'Identity already exists' };
      }

      accounts[sanitizedEmail] = password;
      localStorage.setItem('demo_accounts', JSON.stringify(accounts));
      set({ loading: false });
      return { success: true, verified: false }; // verified=false trigger mock email verify banner
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/home'
        }
      });
      if (error) throw error;
      
      // If user is returned and session is empty, it means confirmation email was dispatched
      const emailConfirmed = !!data.session;
      set({ loading: false });
      return { success: true, verified: emailConfirmed };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // Auth: Password Reset Dispatcher (Recovery link sent to Inbox)
  resetPassword: async (email) => {
    set({ loading: true, error: null });

    if (!isSupabaseConfigured) {
      // Mock recovery link sent
      const sanitizedEmail = email ? email.trim().toLowerCase() : ''
      const accounts = JSON.parse(localStorage.getItem('demo_accounts') || '{}')
      if (sanitizedEmail !== 'atman@fitness.com' && !accounts[sanitizedEmail]) {
        set({ loading: false, error: 'Identity not registered.' });
        return { success: false, error: 'User not found' };
      }
      set({ loading: false });
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/home'
      });
      if (error) throw error;
      set({ loading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // Auth: Password Updater (After clicking recovery link)
  updatePassword: async (newPassword) => {
    set({ loading: true, error: null });

    if (!isSupabaseConfigured) {
      // Mock password update
      const { user } = get();
      if (user) {
        const sanitizedEmail = user.email ? user.email.trim().toLowerCase() : '';
        const accounts = JSON.parse(localStorage.getItem('demo_accounts') || '{}');
        
        if (sanitizedEmail === 'atman@fitness.com') {
          // Can allow updating the default too
          accounts[sanitizedEmail] = newPassword;
        } else {
          accounts[sanitizedEmail] = newPassword;
        }
        localStorage.setItem('demo_accounts', JSON.stringify(accounts));
      }
      set({ isResettingPassword: false, loading: false });
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      set({ isResettingPassword: false, loading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // Set resetting state manually
  setIsResettingPassword: (val) => set({ isResettingPassword: val }),

  // Auth: Logout
  logout: async () => {
    set({ loading: true });
    
    if (!isSupabaseConfigured) {
      localStorage.removeItem('demo_user');
      set({ user: null, dailyLogs: [], workoutsLogged: [] });
      set({ loading: false });
      return;
    }

    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, dailyLogs: [], workoutsLogged: [] });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Metrics: Fetch
  fetchMetrics: async (userId) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('users_metrics')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No row found, insert defaults with today's date as start_date
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: newMetrics, error: insertError } = await supabase
          .from('users_metrics')
          .insert([{ id: userId, ...defaultMetrics, start_date: todayStr }])
          .select()
          .single();

        if (insertError) throw insertError;
        set({ userMetrics: newMetrics });
      } else if (error) {
        throw error;
      } else {
        set({ userMetrics: data });
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
      set({ error: err.message });
    }
  },

  // Metrics: Save/Update
  saveMetrics: async (metrics) => {
    const { user, isDemoMode } = get();
    if (!user) return;

    set({ loading: true });

    if (isDemoMode) {
      const updatedMetrics = { ...get().userMetrics, ...metrics };
      localStorage.setItem('demo_metrics', JSON.stringify(updatedMetrics));
      set({ userMetrics: updatedMetrics, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users_metrics')
        .upsert({ id: user.id, ...metrics })
        .select()
        .single();

      if (error) throw error;
      set({ userMetrics: data });
    } catch (err) {
      console.error("Error saving metrics:", err);
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // Daily Logs: Fetch
  fetchDailyLogs: async (userId) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) throw error;
      set({ dailyLogs: data });
    } catch (err) {
      console.error("Error fetching daily logs:", err);
      set({ error: err.message });
    }
  },

  // Daily Logs: Save/Update
  logDailyMetric: async (dateStr, metrics) => {
    const { user, isDemoMode, dailyLogs } = get();
    if (!user) return;

    if (isDemoMode) {
      let logs = [...dailyLogs];
      const existingIdx = logs.findIndex(l => l.date === dateStr);
      
      const newLog = {
        date: dateStr,
        weight: metrics.weight !== undefined ? parseFloat(metrics.weight) : (existingIdx >= 0 ? logs[existingIdx].weight : null),
        steps: metrics.steps !== undefined ? parseInt(metrics.steps) : (existingIdx >= 0 ? logs[existingIdx].steps : 0),
        calories_consumed: metrics.calories_consumed !== undefined ? parseInt(metrics.calories_consumed) : (existingIdx >= 0 ? logs[existingIdx].calories_consumed : 0),
        water_intake_liters: metrics.water_intake_liters !== undefined ? parseFloat(metrics.water_intake_liters) : (existingIdx >= 0 ? logs[existingIdx].water_intake_liters : 0)
      };

      if (existingIdx >= 0) {
        logs[existingIdx] = { ...logs[existingIdx], ...newLog };
      } else {
        newLog.id = `mock-log-${Date.now()}`;
        logs.push(newLog);
      }

      // Sort logs by date to keep charts correct
      logs.sort((a, b) => new Date(a.date) - new Date(b.date));

      localStorage.setItem('demo_logs', JSON.stringify(logs));
      set({ dailyLogs: logs });
      return;
    }

    try {
      // In Supabase, check if row exists for user_id + date to do upsert properly
      const { data: existing } = await supabase
        .from('daily_logs')
        .select('id, weight, steps, calories_consumed, water_intake_liters')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .single();

      const payload = {
        user_id: user.id,
        date: dateStr,
        weight: metrics.weight !== undefined ? parseFloat(metrics.weight) : (existing ? existing.weight : null),
        steps: metrics.steps !== undefined ? parseInt(metrics.steps) : (existing ? existing.steps : 0),
        calories_consumed: metrics.calories_consumed !== undefined ? parseInt(metrics.calories_consumed) : (existing ? existing.calories_consumed : 0),
        water_intake_liters: metrics.water_intake_liters !== undefined ? parseFloat(metrics.water_intake_liters) : (existing ? existing.water_intake_liters : 0)
      };

      if (existing) {
        payload.id = existing.id;
      }

      const { error } = await supabase
        .from('daily_logs')
        .upsert(payload);

      if (error) throw error;
      await get().fetchDailyLogs(user.id);
    } catch (err) {
      console.error("Error logging daily metric:", err);
      set({ error: err.message });
    }
  },

  // Workouts: Fetch
  fetchWorkouts: async (userId) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('workouts_logged')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      set({ workoutsLogged: data });
    } catch (err) {
      console.error("Error fetching workouts:", err);
      set({ error: err.message });
    }
  },

  // Workouts: Log
  logWorkout: async (workoutData) => {
    const { user, isDemoMode, workoutsLogged } = get();
    if (!user) return;

    if (isDemoMode) {
      const newWorkout = {
        id: `mock-workout-${Date.now()}`,
        user_id: user.id,
        date: workoutData.date,
        exercise_name: workoutData.exercise_name,
        sets: parseInt(workoutData.sets),
        reps: parseInt(workoutData.reps),
        weight_used: parseFloat(workoutData.weight_used || 0),
        status: workoutData.status
      };
      
      const newWorkouts = [newWorkout, ...workoutsLogged];
      localStorage.setItem('demo_workouts', JSON.stringify(newWorkouts));
      set({ workoutsLogged: newWorkouts });
      return;
    }

    try {
      const { error } = await supabase
        .from('workouts_logged')
        .insert([{
          user_id: user.id,
          date: workoutData.date,
          exercise_name: workoutData.exercise_name,
          sets: parseInt(workoutData.sets),
          reps: parseInt(workoutData.reps),
          weight_used: parseFloat(workoutData.weight_used || 0),
          status: workoutData.status
        }]);

      if (error) throw error;
      await get().fetchWorkouts(user.id);
    } catch (err) {
      console.error("Error logging workout:", err);
      set({ error: err.message });
    }
  }
}));
