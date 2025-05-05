import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PomodoroTimerOptions {
  pomodoroMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
  longBreakInterval?: number;
}

/**
 * Custom hook for Pomodoro timer functionality
 */
export default function usePomodoroTimer({
  pomodoroMinutes = 25,
  shortBreakMinutes = 5,
  longBreakMinutes = 15,
  longBreakInterval = 4
}: PomodoroTimerOptions = {}) {
  const [minutes, setMinutes] = useState(pomodoroMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Effect to handle timer countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          handleTimerComplete();
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, minutes, seconds]);

  // Effect to show browser notifications
  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Handle timer completion
  const handleTimerComplete = () => {
    if (isBreak) {
      // Break finished, start a new pomodoro
      resetToPomodoro();
      
      toast({
        title: "Break finished!",
        description: "Time to focus on your next pomodoro session.",
      });
      
      showNotification("Break finished!", "Time to focus on your next pomodoro session.");
    } else {
      // Pomodoro finished, start a break
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      const isLongBreak = newCompletedPomodoros % longBreakInterval === 0;
      
      if (isLongBreak) {
        setMinutes(longBreakMinutes);
        
        toast({
          title: "Time for a long break!",
          description: `You've completed ${newCompletedPomodoros} pomodoros. Take a ${longBreakMinutes}-minute break.`,
        });
        
        showNotification(
          "Time for a long break!",
          `You've completed ${newCompletedPomodoros} pomodoros. Take a ${longBreakMinutes}-minute break.`
        );
      } else {
        setMinutes(shortBreakMinutes);
        
        toast({
          title: "Pomodoro completed!",
          description: `Well done! Take a ${shortBreakMinutes}-minute break.`,
        });
        
        showNotification(
          "Pomodoro completed!",
          `Well done! Take a ${shortBreakMinutes}-minute break.`
        );
      }
      
      setSeconds(0);
      setIsBreak(true);
    }
  };

  // Show browser notification
  const showNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico"
      });
      
      // Also play a sound
      const audio = new Audio("https://cdn.freesound.org/previews/320/320775_5260872-lq.mp3");
      audio.play().catch(e => console.error("Error playing notification sound:", e));
    }
  };

  // Start the timer
  const start = () => {
    setIsRunning(true);
  };

  // Pause the timer
  const pause = () => {
    setIsRunning(false);
  };

  // Reset the timer to a pomodoro
  const resetToPomodoro = () => {
    setIsRunning(false);
    setMinutes(pomodoroMinutes);
    setSeconds(0);
    setIsBreak(false);
  };

  // Reset the timer and stats
  const reset = () => {
    setIsRunning(false);
    setMinutes(pomodoroMinutes);
    setSeconds(0);
    setIsBreak(false);
  };

  // Reset all stats
  const resetAll = () => {
    reset();
    setCompletedPomodoros(0);
  };

  return {
    minutes,
    seconds,
    isRunning,
    isBreak,
    completedPomodoros,
    start,
    pause,
    reset,
    resetAll,
    resetToPomodoro
  };
}
