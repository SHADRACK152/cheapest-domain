'use client';

import { motion } from 'framer-motion';
import { Eye, DollarSign, Search, CheckCircle } from 'lucide-react';

const team = [
  {
    initials: 'JM',
    name: 'Ricky Mark Okello',
    role: 'Co-Founder',
    bio: 'Ricky Mark is the founder of CheapestDomains.co.ke, a platform dedicated to helping businesses and individuals easily compare domain registration, renewal, and transfer prices. His goal is to make domain ownership more transparent and affordable by giving users the information they need to choose the best registrar without hidden costs.',
  },
  {
    initials: 'SM',
    name: 'Shadrack Mark emadau',
    role: 'CTO',
    bio: 'Building the infrastructure that powers millions of domains globally.',
  },
  {
    initials: 'MN',
    name: 'Maria Nyaduse',
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

const values = [
  {
    icon: Eye,
    title: 'Transparency',
    description: 'Showing both registration and renewal prices so you know the real long-term cost.',
  },
  {
    icon: Search,
    title: 'Clarity',
    description: 'Explaining domain costs in simple, easy-to-understand language.',
  },
  {
    icon: Search,
    title: 'Research',
    description: 'Comparing multiple domain registrars so you get the full picture.',
  },
  {
    icon: DollarSign,
    title: 'Value',
    description: 'Helping you find the best long-term domain deals — not just the cheapest first year.',
  },
];

const whatWeDo = [
  'Find the cheapest domain names available today',
  'Compare domain registration and renewal prices',
  'Identify registrars with fair and affordable renewal fees',
  'Avoid misleading introductory domain deals',
  'Make informed decisions before buying a domain',
];

const whoItsFor = [
  'Entrepreneurs starting an online business',
  'Developers and designers registering domains for projects',
  'Bloggers and content creators launching new websites',
  'Anyone searching for the best place to buy cheap domain names',
];

const ourMission = [
  'Find cheap and affordable domain names',
  'Compare services before making a decision',
  'Avoid hidden fees and misleading promotions',
  'Get reliable services without paying inflated prices',
];

export default function AboutPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container-wide">

        {/* About CheapestDomains */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] mb-4">
            About CheapestDomains
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-primary-600 mb-8">
            Helping You Find the Cheapest Domain Names — Without Hidden Renewal Costs
          </h2>

          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Buying a domain name should be simple and affordable. Unfortunately, many people discover
              too late that the cheap domain price they saw was only for the first year.
            </p>
            <p>
              Many domain registrars advertise extremely low introductory prices, sometimes as low as a
              few hundred Kenyan shillings. However, when it&apos;s time to renew the domain, the price
              can double or even triple. For individuals, startups, and small businesses, this can become
              an unexpected long-term cost.
            </p>
            <p>
              This website was created to bring honesty and transparency to domain pricing and why you
              should not fall for cheaper initial prices, as they will cost you a year later.
            </p>
          </div>

          {/* What We Do */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-[#111111] mb-4">What We Do</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We research and compare domain registration prices and renewal costs from different domain
              registrars so you can clearly see the real cost of owning a domain name before paying for
              one.
            </p>
            <p className="text-gray-600 mb-3 font-medium">Our goal is to help you:</p>
            <ul className="space-y-2">
              {whatWeDo.map((point) => (
                <li key={point} className="flex items-start gap-3 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Instead of focusing only on the first-year price, we focus on the true long-term cost of
              domain ownership.
            </p>
          </div>

          {/* Why This Matters */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-[#111111] mb-4">Why This Matters</h3>
            <p className="text-gray-600 leading-relaxed">
              A domain name is often the first step to building a website, starting a business, launching
              a blog, or creating an online brand. But many people — especially first-time website owners
              — do not realize that domain pricing can vary widely between registrars. By sharing clear
              comparisons and honest insights, we aim to make it easier for anyone to find affordable
              domain registration without surprises later.
            </p>
          </div>
        </motion.div>

        {/* Our Approach / Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-[#111111] text-center mb-4">Our Approach</h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-12">
            We believe domain pricing should be easy to understand. That is why we focus on:
          </p>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div key={idx} variants={item} className="glass-card text-center group">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white group-hover:scale-110 mb-4">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#111111] mb-2">{val.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{val.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Who This Site Is For */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl font-bold text-[#111111] mb-4">Who This Site Is For</h2>
          <p className="text-gray-600 mb-4">This website is designed for:</p>
          <ul className="space-y-2 mb-6">
            {whoItsFor.map((point) => (
              <li key={point} className="flex items-start gap-3 text-gray-600">
                <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
          <p className="text-gray-600 leading-relaxed">
            If you are looking for the most affordable domains with fair renewal prices, this site is
            built to help you make the right choice. We believe domain pricing should be transparent.{' '}
            <strong className="text-[#111111]">A cheap domain should stay affordable even when it renews.</strong>
          </p>
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl font-bold text-[#111111] mb-3">Our Story</h2>
          <h3 className="text-xl font-semibold text-primary-600 mb-6">
            Finding Quality Services Without Paying Unnecessary Prices
          </h3>

          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              The internet is full of services that look cheap at first — especially when you search for
              things like cheap domains, affordable hosting, or low-cost online services. But many people
              later discover that the initial price was only part of the story.
            </p>
            <p>
              Hidden renewal fees, unexpected price increases, and confusing pricing structures often turn
              what looked like a good deal into an expensive long-term commitment.
            </p>
            <p>This website was created to help people avoid those surprises.</p>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold text-[#111111] mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our goal is simple: help you find quality services at fair and affordable prices. We believe
              that people starting websites, businesses, or online projects should not have to struggle
              through complicated pricing or misleading promotions just to get something as basic as a
              domain name or online service.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By carefully researching and comparing different providers, we aim to highlight services
              that offer real value without excessive or hidden costs.
            </p>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold text-[#111111] mb-4">What We Do</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We spend time searching, researching, and comparing different platforms and providers to
              understand how their pricing actually works. Instead of only looking at the price shown on
              the front page, we go deeper. We review:
            </p>
            <ul className="space-y-2">
              {['Registration prices', 'Renewal costs', 'Long-term pricing structures', 'Service quality and reliability', 'Overall value for money'].map((point) => (
                <li key={point} className="flex items-start gap-3 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold text-[#111111] mb-6">Our Approach</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Eye, title: 'Transparency', desc: 'We believe pricing should be clear and easy to understand.' },
                { icon: DollarSign, title: 'Affordability', desc: 'Quality services should not require paying unnecessarily high prices.' },
                { icon: Search, title: 'Research', desc: 'We carefully compare available options so you can find services that offer real value.' },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="glass-card text-center">
                    <Icon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-[#111111] mb-2">{p.title}</h4>
                    <p className="text-sm text-gray-500">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold text-[#111111] mb-4">Who This Site Is For</h3>
            <p className="text-gray-600 mb-4">This site is for anyone who wants to:</p>
            <ul className="space-y-2">
              {ourMission.map((point) => (
                <li key={point} className="flex items-start gap-3 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Whether you are starting a website, launching a business, or simply looking for better deals
              online, our goal is to help you find quality services that remain affordable over time.
            </p>
          </div>
        </motion.div>

        {/* Leadership */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-[#111111] text-center mb-12">Our Leadership</h2>
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
                  {member.initials}
                </div>
                <h3 className="text-lg font-semibold text-[#111111]">{member.name}</h3>
                <p className="text-sm text-primary-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
