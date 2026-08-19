import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">ShopHub</span>
            </div>
            <p className="text-sm leading-relaxed">Your one-stop destination for premium products. Shop with confidence and enjoy seamless online shopping.</p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"><FiGithub size={18} /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"><FiTwitter size={18} /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"><FiInstagram size={18} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop" className="hover:text-primary-400 transition-colors">Shop All</Link></li>
              <li><Link to="/shop?is_featured=true" className="hover:text-primary-400 transition-colors">Featured Products</Link></li>
              <li><Link to="/shop?is_new_arrival=true" className="hover:text-primary-400 transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop?ordering=-sales_count" className="hover:text-primary-400 transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Help Center</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Shipping Info</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><FiMapPin size={16} className="text-primary-400" /> 123 Commerce St, Mumbai, India</li>
              <li className="flex items-center gap-2"><FiPhone size={16} className="text-primary-400" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><FiMail size={16} className="text-primary-400" /> support@shophub.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} ShopHub. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link to="/" className="hover:text-gray-300">Privacy Policy</Link>
            <Link to="/" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
