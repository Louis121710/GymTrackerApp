import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing workout timer functionality
 * Handles workout duration tracking and rest timer management
 * 
 * @returns {Object} Timer state and control functions
 * @returns {boolean} isWorkoutActive - Whether workout is currently active
 * @returns {number} workoutDuration - Elapsed workout time in seconds
 * @returns {number} restTimer - Current rest timer value in seconds
 * @returns {boolean} restTimerActive - Whether rest timer is running
 * @returns {number} defaultRestTime - Default rest time in seconds
 * @returns {Function} startWorkout - Function to start the workout timer
 * @returns {Function} finishWorkout - Function to stop the workout timer
 * @returns {Function} startRestTimer - Function to start rest timer
 * @returns {Function} stopRestTimer - Function to stop rest timer
 * @returns {Function} setDefaultRestTime - Function to set default rest time
 */
export const useWorkoutTimer = () => {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [defaultRestTime, setDefaultRestTime] = useState(90);

  const restTimerIntervalRef = useRef(null);
  const workoutTimerIntervalRef = useRef(null);

  // Rest timer effect
  useEffect(() => {
    if (restTimerActive && restTimer > 0) {
      restTimerIntervalRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
      }
    }
    return () => {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
      }
    };
  }, [restTimerActive, restTimer]);

  // Workout duration timer effect
  useEffect(() => {
    if (isWorkoutActive && workoutStartTime) {
      workoutTimerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - workoutStartTime) / 1000);
        setWorkoutDuration(elapsed);
      }, 1000);
    } else {
      if (workoutTimerIntervalRef.current) {
        clearInterval(workoutTimerIntervalRef.current);
      }
    }
    return () => {
      if (workoutTimerIntervalRef.current) {
        clearInterval(workoutTimerIntervalRef.current);
      }
    };
  }, [isWorkoutActive, workoutStartTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
      }
      if (workoutTimerIntervalRef.current) {
        clearInterval(workoutTimerIntervalRef.current);
      }
    };
  }, []);

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutStartTime(new Date().getTime());
    setWorkoutDuration(0);
  };

  const finishWorkout = () => {
    setIsWorkoutActive(false);
    setWorkoutStartTime(null);
    setWorkoutDuration(0);
  };

  const startRestTimer = (seconds = null) => {
    const time = seconds !== null ? seconds : defaultRestTime;
    setRestTimer(time);
    setRestTimerActive(true);
  };

  const stopRestTimer = () => {
    setRestTimerActive(false);
    setRestTimer(0);
  };

  return {
    isWorkoutActive,
    workoutDuration,
    restTimer,
    restTimerActive,
    defaultRestTime,
    startWorkout,
    finishWorkout,
    startRestTimer,
    stopRestTimer,
    setDefaultRestTime
  };
};
