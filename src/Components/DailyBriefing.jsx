import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

const DailyBriefing = () => {
  const [briefing, setBriefing] = useState(null);

  useEffect(() => {
    // TODO: Fetch daily briefing from AI service
    const dummyBriefing = {
      date: new Date().toLocaleDateString(),
      summary: "Today you have 3 important emails, 2 upcoming meetings, and 5 tasks due.",
      topPriorities: [
        "Respond to client proposal by 2 PM",
        "Prepare for team meeting at 4 PM",
        "Review and approve Q2 report"
      ],
      upcomingEvents: [
        { time: "11:00 AM", title: "Call with Marketing Team" },
        { time: "2:00 PM", title: "Client Proposal Deadline" },
        { time: "4:00 PM", title: "Weekly Team Meeting" }
      ]
    };
    setBriefing(dummyBriefing);
  }, []);

  if (!briefing) return <div>Loading briefing...</div>;

  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Briefing</h2>
      <p className="text-gray-600 mb-6">{briefing.summary}</p>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Top Priorities</h3>
      <ul className="space-y-2 mb-6">
        {briefing.topPriorities.map((priority, index) => (
          <li key={index} className="flex items-center text-gray-700">
            <CheckCircle className="text-green-500 mr-2" size={20} />
            {priority}
          </li>
        ))}
      </ul>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Upcoming Events</h3>
      <ul className="space-y-2">
        {briefing.upcomingEvents.map((event, index) => (
          <li key={index} className="flex items-center text-gray-700">
            <Clock className="text-blue-500 mr-2" size={20} />
            <span className="font-semibold mr-2">{event.time}:</span> {event.title}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default DailyBriefing;