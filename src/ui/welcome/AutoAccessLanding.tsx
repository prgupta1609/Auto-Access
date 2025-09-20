"use client"

import { useState, useEffect } from "react"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion"
import {
  Eye,
  Keyboard,
  Hand,
  Globe,
  Camera,
  Volume2,
  Mic,
  Palette,
  Subtitles,
  Shield,
  Zap,
  Users,
  Settings,
  Download,
  Github,
  FileText,
  Check,
} from "lucide-react"

export default function AutoAccessLanding() {
  const [activeSection, setActiveSection] = useState("")
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  const fullText = "AutoAccess - Making the Web Accessible"

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 },
    )

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const typeText = () => {
      if (typingText.length < fullText.length) {
        setTypingText(fullText.slice(0, typingText.length + 1))
        timeout = setTimeout(typeText, 100)
      } else {
        setTimeout(() => {
          setTypingText("")
        }, 2000)
      }
    }

    if (typingText.length === 0 && isTyping) {
      timeout = setTimeout(typeText, 500)
    } else if (typingText.length < fullText.length) {
      timeout = setTimeout(typeText, 100)
    }

    return () => clearTimeout(timeout)
  }, [typingText, fullText, isTyping])

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  const openExtension = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') })
  }

  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AutoAccess</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("profiles")}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Profiles
            </button>
            <button onClick={() => scrollToSection("pricing")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection("privacy")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Privacy
            </button>
          </div>
          <Button onClick={openExtension} className="bg-blue-600 hover:bg-blue-700 text-white">Open Extension</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            {/* Main Content */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Eye className="w-4 h-4" />
                <span>Chrome Extension</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight tracking-tight">
                <span className="block font-light">{typingText}</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
                Transform any website into an accessible experience with AI-powered tools, voice commands, and
                intelligent adaptations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button
                  size="lg"
                  onClick={openExtension}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 shadow-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Open Extension
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 bg-transparent">
                  View Demo
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 bg-transparent">
                  Explore Features
                </Button>
              </div>
            </div>

            {/* Feature Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* AutoAccess Features */}
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-blue-200">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-blue-900">
                    AutoAccess Extension
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Comprehensive accessibility tools designed for everyone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm">AI-powered OCR and alt text generation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm">Advanced text-to-speech with voice options</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm">Voice commands and speech-to-text</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm">Smart contrast fixer (WCAG 2.1 AA)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm">Enhanced keyboard navigation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm">Live captions and transcripts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm">Sign language overlay with ASL support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm">Custom accessibility profiles</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm">Privacy-first local processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm">Works on all websites</span>
                  </div>
                </CardContent>
              </Card>

              {/* Standard Web Experience */}
              <Card className="p-8 bg-white/60 backdrop-blur-sm border border-gray-300">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-700">
                    Standard Web Browsing
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Basic browser accessibility without enhancements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-sm text-gray-600">No automatic alt text for images</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-sm text-gray-600">Limited text-to-speech options</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-sm text-gray-600">No voice command support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-sm text-gray-600">Poor contrast on many websites</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-sm text-gray-600">Inconsistent keyboard navigation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-sm text-gray-600">No automatic captions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-sm text-gray-600">No sign language support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-sm text-gray-600">No personalization options</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-sm text-gray-600">Relies on website implementation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-sm text-gray-600">Inconsistent across websites</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <p className="text-lg text-gray-600 mb-6">
                Join thousands of users making the web more accessible
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Privacy First</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Works Everywhere</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="getting-started" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Getting Started</h2>
            <p className="text-xl text-gray-600">Set up AutoAccess in just 4 simple steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Download, title: "First Launch", desc: "Install the extension and open any website" },
              { icon: Settings, title: "Quick Setup", desc: "Choose your accessibility profile and preferences" },
              { icon: Zap, title: "Configure Features", desc: "Enable AI features and set up API keys if needed" },
              { icon: Check, title: "Test Features", desc: "Try voice commands, OCR, and other tools" },
            ].map((step, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-xl text-gray-600">
              Powerful accessibility tools powered by AI and modern web technologies
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Global Accessibility Mode",
                desc: "One-click improvements with automated audits, safe fixes, before/after comparisons, and detailed reports.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Camera,
                title: "AI-Powered OCR",
                desc: "Automatic alt text generation, batch processing for multiple images, and multilingual support.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Volume2,
                title: "Text-to-Speech (TTS)",
                desc: "Multiple voice options, adjustable speed and pitch, word highlighting, and keyboard shortcuts (Alt+R).",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Mic,
                title: "Speech-to-Text (STT)",
                desc: "Voice navigation commands like 'Read', 'Next', 'Scroll', and 'Click' for hands-free browsing.",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: Palette,
                title: "Smart Contrast Fixer",
                desc: "WCAG 2.1 AA compliance, color-blind friendly presets, and real-time preview of changes.",
                color: "from-indigo-500 to-purple-500",
              },
              {
                icon: Keyboard,
                title: "Enhanced Keyboard Navigation",
                desc: "Skip links, logical tab order, and full support for single-page applications.",
                color: "from-teal-500 to-blue-500",
              },
              {
                icon: Subtitles,
                title: "Live Captions",
                desc: "Real-time captions for audio content, searchable transcripts, and multilingual support.",
                color: "from-pink-500 to-rose-500",
              },
              {
                icon: Hand,
                title: "Sign Language Overlay",
                desc: "ASL avatar animations with smooth Lottie integration and context-aware translations.",
                color: "from-yellow-500 to-orange-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <CardHeader>
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Profiles Section */}
      <section id="profiles" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Accessibility Profiles</h2>
            <p className="text-xl text-gray-600">Pre-configured settings for different accessibility needs</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Default",
                desc: "Standard web browsing with basic accessibility enhancements",
                users: "General users",
              },
              {
                name: "Blind User",
                desc: "Screen reader optimization, enhanced keyboard navigation, audio descriptions",
                users: "Blind users",
              },
              {
                name: "Low Vision",
                desc: "High contrast, magnification, large text, color adjustments",
                users: "Low vision users",
              },
              {
                name: "Dyslexic",
                desc: "Dyslexia-friendly fonts, reading guides, text spacing adjustments",
                users: "Dyslexic users",
              },
            ].map((profile, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group"
              >
                <CardHeader>
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-xl">{profile.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">{profile.users}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{profile.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Custom Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Create and configure your own accessibility profiles with site-specific overrides and personalized
                  settings.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create Custom Profile</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section id="privacy" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Privacy & Security</h2>
            <p className="text-xl text-gray-600">Your privacy is our priority</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-xl">What We Collect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>• Anonymous usage statistics</li>
                  <li>• Error reports (no personal data)</li>
                  <li>• Performance metrics</li>
                  <li>• Feature usage analytics</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Eye className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-xl">What We Don't Collect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>• Personal information</li>
                  <li>• Page content or URLs</li>
                  <li>• API keys or credentials</li>
                  <li>• Browsing history</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Zap className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <CardTitle className="text-xl">Security Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>• Local processing by default</li>
                  <li>• Encrypted key storage</li>
                  <li>• No data transmission</li>
                  <li>• Open source transparency</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pricing Plans</h2>
            <p className="text-xl text-gray-600">Choose the plan that works for you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Freemium</CardTitle>
                <div className="text-4xl font-bold text-blue-600">Free</div>
                <CardDescription>Local-only features, free forever</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Browser-based OCR</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Native TTS/STT</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Basic accessibility profiles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Keyboard navigation</span>
                </div>
                <Button className="w-full mt-6">Get Started</Button>
              </CardContent>
            </Card>
            <Card className="relative border-blue-600 border-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold text-blue-600">
                  $5<span className="text-lg text-gray-600">/month</span>
                </div>
                <CardDescription>Advanced AI features and cloud services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Everything in Freemium</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>OpenAI integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Advanced voice synthesis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Custom profiles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Priority support</span>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">Upgrade to Pro</Button>
              </CardContent>
            </Card>
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-blue-600">
                  $15<span className="text-lg text-gray-600">/user/month</span>
                </div>
                <CardDescription>For organizations and teams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Everything in Pro</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Team management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Custom integrations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Dedicated support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>SLA guarantee</span>
                </div>
                <Button className="w-full mt-6 bg-transparent" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Special discounts available for NGOs and educational institutions
            </p>
            <div className="flex justify-center space-x-4">
              <Badge variant="outline">50% off for NGOs</Badge>
              <Badge variant="outline">30% off for Education</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="lg" onClick={openExtension} className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
          <Download className="w-5 h-5 mr-2" />
          Install AutoAccess Now
        </Button>
      </div>
    </div>
  )
}