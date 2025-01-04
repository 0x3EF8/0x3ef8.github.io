'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { content } from '@/config/content';

interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    ref_type?: string;
    ref?: string;
    description?: string;
    action?: string;
    issue?: { title: string };
    pull_request?: { title: string };
  };
}

export function GitHubActivity() {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch(content.githubActivity.apiUrl);
      const data = await response.json();
      setEvents(data.slice(0, content.githubActivity.maxEvents));
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const intervals = content.githubActivity.updateIntervals;
      let currentIntervalIndex = 0;

      const interval = setInterval(() => {
        setCurrentEventIndex((prevIndex) => (prevIndex + 1) % events.length);
        currentIntervalIndex = (currentIntervalIndex + 1) % intervals.length;
      }, intervals[currentIntervalIndex]);

      return () => clearInterval(interval);
    }
  }, [events]);

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diff = now.getTime() - eventTime.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  };

  const formatEventText = (event: GitHubEvent) => {
    let actionText = '';
    switch (event.type) {
      case 'PushEvent':
        actionText = `Pushed to ${event.repo.name}`;
        break;
      case 'CreateEvent':
        actionText = `Created ${event.payload.ref_type} ${event.payload.ref || ''} in ${event.repo.name}`;
        break;
      case 'IssuesEvent':
        actionText = `${event.payload.action} issue "${event.payload.issue?.title}" in ${event.repo.name}`;
        break;
      case 'PullRequestEvent':
        actionText = `${event.payload.action} pull request "${event.payload.pull_request?.title}" in ${event.repo.name}`;
        break;
      case 'WatchEvent':
        actionText = `Starred ${event.repo.name}`;
        break;
      case 'ForkEvent':
        actionText = `Forked ${event.repo.name}`;
        break;
      default:
        actionText = `${event.type.replace(/([A-Z])/g, ' $1').trim()} on ${event.repo.name}`;
    }
    return `${actionText} ${getRelativeTime(event.created_at)}`;
  };

  const getFloatSpeed = (index: number) => {
    switch (index % 3) {
      case 0:
        return { duration: 5, ease: 'linear' };
      case 1:
        return { duration: 10, ease: 'linear' };
      case 2:
        return { duration: 15, ease: 'linear' };
    }
  };

  return (
    <div className={content.githubActivity.containerClass}>
      <AnimatePresence>
        {events.length > 0 && (
          <motion.div
            key={events[currentEventIndex].id}
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: -200 }}
            exit={{ opacity: 0, y: -400 }}
            transition={{
              ...getFloatSpeed(currentEventIndex),
              repeat: Infinity,
              repeatType: 'loop',
              repeatDelay: 0,
            }}
            className={content.githubActivity.textClass}
          >
            {formatEventText(events[currentEventIndex])}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
