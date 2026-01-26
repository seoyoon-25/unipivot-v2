'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'

export function DonationBanner() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-white rounded-full blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-white rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-8"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              함께 만들어가는 한반도
            </h2>
            <p className="text-xl text-white/80 max-w-xl">
              여러분의 후원이 남북청년의 교류를 가능하게 합니다.
              작은 관심이 큰 변화를 만듭니다.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/donate"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-full font-bold text-lg shadow-2xl shadow-black/20 hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1"
            >
              후원하기
              <motion.div
                className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"
                whileHover={{ rotate: -45 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
