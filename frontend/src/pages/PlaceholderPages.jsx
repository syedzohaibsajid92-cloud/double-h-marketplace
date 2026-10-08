import React from 'react';

export const AboutPage = () => (
  <div className="min-h-screen py-12">
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">About Double H Hardware</h1>
      <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
        <p>
          Double H Hardware is Pakistan's leading online marketplace for quality tools,
          equipment, and industrial supplies. Founded with a commitment to excellence, we serve
          builders, contractors, and DIY enthusiasts nationwide.
        </p>
        <p>
          Our mission is to make professional-grade hardware accessible to everyone at competitive prices
          with exceptional customer service.
        </p>
      </div>
    </div>
  </div>
);

export const ContactPage = () => (
  <div className="min-h-screen py-12 bg-gray-50">
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

      <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Get in Touch</h3>
          <p className="text-gray-600">
            Have a question? We'd love to hear from you. Send us a message and we'll
            respond as soon as possible.
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="Your message..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition"
          >
            Send Message
          </button>
        </form>

        <div className="pt-6 border-t space-y-2 text-gray-600">
          <p>📞 +92 300 1234567</p>
          <p>📧 support@doublehardware.pk</p>
          <p>📍 Karachi, Pakistan</p>
        </div>
      </div>
    </div>
  </div>
);

export const RegisterPage = () => (
  <div className="min-h-screen bg-gradient-to-r from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
      <h1 className="text-3xl font-bold text-primary-500 text-center mb-8">Create Account</h1>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition"
        >
          Create Account
        </button>
      </form>

      <p className="text-center text-gray-600 mt-4">
        Already have an account?{' '}
        <a href="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
          Sign in
        </a>
      </p>
    </div>
  </div>
);
