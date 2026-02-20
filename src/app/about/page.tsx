'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Award, TrendingUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanyStats {
  domainsRegistered: string;
  customers: string;
  yearsInBusiness: string;
  uptime: string;
}

const team = [
  {
    name: 'James Mwangi',
    role: 'CEO & Founder',
    bio: 'Passionate about making the internet accessible to everyone in Africa and beyond.',
  },
  {
    name: 'Amina Osei',
    role: 'CTO',
    bio: 'Building the infrastructure that powers millions of domains globally.',
  },
  {
    name: 'David Okafor',
    role: 'Head of Support',
    bio: 'Ensuring every customer gets world-class support, 24 hours a day.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/stats');
        const result = await response.json();
        
        if (response.ok) {
          setStats(result.data);
          setDataSource(result.source);
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
        // Use default values on error
        setStats({
          domainsRegistered: '500K+',
          customers: '120K+',
          yearsInBusiness: '10+',
          uptime: '99.99%',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  const statsData = stats ? [
    { icon: Globe, label: 'Domains Registered', value: stats.domainsRegistered },
    { icon: Users, label: 'Happy Customers', value: stats.customers },
    { icon: Award, label: 'Years in Business', value: stats.yearsInBusiness },
    { icon: TrendingUp, label: 'Uptime', value: stats.uptime },
  ] : [];
  return (
    <div className="py-12 md:py-20">
      <div className="container-wide">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-20 max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111]">
            About CheapestDomains
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            We&apos;re on a mission to make domain registration affordable and
            accessible for everyone. Founded in Nairobi, trusted globally.
          </p>
          
          {/* Data Source Indicator */}
          {dataSource && dataSource !== 'truehost' && (
            <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg py-2 px-4 max-w-md mx-auto mt-4">
              <AlertCircle className="h-4 w-4" />
              <span>
                {dataSource === 'default' ? 'Using cached statistics' : 'Real-time data from TrueHost'}
              </span>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card text-center">
                <Skeleton className="h-8 w-8 rounded-full mx-auto mb-3" />
                <Skeleton className="h-8 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={item}
                className="glass-card text-center"
              >
                <Icon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-[#111111]">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
        )}

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-6 mb-20"
        >
          <h2 className="text-3xl font-bold text-[#111111]">Our Story</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              CheapestDomains was born from a simple frustration: domain names
              were too expensive in Africa. Our founders believed that everyone
              deserves affordable access to the internet, regardless of where
              they are.
            </p>
            <p>
              Starting in 2015 from a small office in Nairobi, we&apos;ve grown to
              serve over 120,000 customers across 40+ countries. Our commitment
              remains the same — transparent pricing, exceptional support, and
              the lowest prices you&apos;ll find anywhere.
            </p>
            <p>
              Today, we manage over 500,000 domains and continue to expand our
              services. From domain registration to DNS management, we&apos;re
              building the tools that help businesses and individuals thrive
              online.
            </p>
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-[#111111] text-center mb-12">
            Our Leadership
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={item}
                className="glass-card text-center group"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <h3 className="text-lg font-semibold text-[#111111]">
                  {member.name}
                </h3>
                <p className="text-sm text-primary-600 font-medium">
                  {member.role}
                </p>
                <p className="text-sm text-gray-500 mt-2">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
