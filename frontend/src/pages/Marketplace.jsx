import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Gavel, DollarSign, Plus, X, Globe, User, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

function isValidUrl(str) {
  if (!str || str.trim() === '') return true;
  try {
    const url = new URL(str);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

const PaymentModal = ({ listing, onClose, onPay }) => {
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvc: '' });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md relative z-10"
        style={{ perspective: '1000px' }}
      >
        <div className="relative">
          {/* Card UI */}
          <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-[#1a1c24] to-black overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-12 h-8 rounded bg-gradient-to-r from-yellow-600 to-yellow-400 opacity-80 shadow-inner flex items-center justify-center">
                <div className="w-8 h-4 border border-yellow-800/50 rounded-sm grid grid-cols-3 gap-[1px]">
                  <div className="border-r border-yellow-800/30"></div>
                  <div className="border-r border-yellow-800/30"></div>
                  <div></div>
                </div>
              </div>
              <div className="text-xl font-bold tracking-widest opacity-50 italic text-white">PAYMENT</div>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block uppercase tracking-wider font-semibold">Card Number</label>
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-transparent border-b border-white/20 focus:border-white/50 outline-none text-xl tracking-widest py-1 font-mono transition-colors text-white placeholder-gray-600"
                  value={cardDetails.number}
                  onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] text-gray-400 mb-1 block uppercase tracking-wider font-semibold">Card Holder</label>
                  <input 
                    type="text" 
                    placeholder="JOHN DOE"
                    className="w-full bg-transparent border-b border-white/20 focus:border-white/50 outline-none uppercase py-1 transition-colors text-white placeholder-gray-600"
                    value={cardDetails.name}
                    onChange={e => setCardDetails({...cardDetails, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block uppercase tracking-wider font-semibold">Expires</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    className="w-full bg-transparent border-b border-white/20 focus:border-white/50 outline-none py-1 font-mono transition-colors text-white placeholder-gray-600"
                    value={cardDetails.expiry}
                    onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block uppercase tracking-wider font-semibold">CVC</label>
                  <input 
                    type="text" 
                    placeholder="***"
                    className="w-full bg-transparent border-b border-white/20 focus:border-white/50 outline-none py-1 font-mono transition-colors text-white placeholder-gray-600"
                    value={cardDetails.cvc}
                    onChange={e => setCardDetails({...cardDetails, cvc: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
           <button className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium text-white" onClick={onClose}>
             Cancel
           </button>
           <button 
             className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-bold text-white hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(16,185,129,0.4)]"
             onClick={() => {
               if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvc) {
                 toast.error("Please fill out all card details");
                 return;
               }
               onPay(listing.id);
             }}
           >
             Pay ${listing.price}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

const Countdown = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiresAt) return;
    
    const updateTime = () => {
      const now = new Date().getTime();
      const end = new Date(expiresAt).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft('Ended');
        return true; // signal to clear interval
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      return false;
    };

    const ended = updateTime();
    if (ended) return;

    const interval = setInterval(() => {
      const ended = updateTime();
      if (ended) clearInterval(interval);
    }, 60000); // update every minute is enough

    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft ? (
    <span className="text-purple-400 font-mono text-[10px] bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 shadow-sm animate-pulse">
      {timeLeft}
    </span>
  ) : null;
};

const Marketplace = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'sale', 'auction'
  const [bidModalListing, setBidModalListing] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [checkoutListing, setCheckoutListing] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [projectType, setProjectType] = useState('personal'); // 'personal' or 'team'
  const [listingType, setListingType] = useState('sale'); // 'sale' or 'auction'
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/marketplace`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch {
      // silently handle fetch errors
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async () => {
    if (!title || !description || !price) {
      toast.error('Title, description, and price are required.');
      return;
    }
    if (!isValidUrl(imageLink) || !isValidUrl(demoLink)) {
      toast.error('Please enter a valid HTTP/HTTPS URL for the image and demo links.');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/marketplace/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('da_token')}`
        },
        body: JSON.stringify({
          title, description, images: imageLink ? [imageLink] : [], link: demoLink,
          type: projectType, listingType, price
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('Listing created successfully!');
      setShowCreateModal(false);
      setTitle(''); setDescription(''); setImageLink(''); setDemoLink(''); setPrice('');
      fetchListings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBuy = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/marketplace/${id}/buy`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Project purchased successfully!');
      fetchListings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBid = async (listing) => {
    setBidModalListing(listing);
    setBidAmount(String((listing.currentBid || 0) + 10));
  };

  const confirmBid = async () => {
    if (!bidModalListing) return;
    const amount = Number(bidAmount);
    if (!amount || amount <= (bidModalListing.currentBid || 0)) {
      toast.error(`Bid must be higher than $${bidModalListing.currentBid || 0}`);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/marketplace/${bidModalListing.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('da_token')}`
        },
        body: JSON.stringify({ bidAmount: amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Bid placed successfully!');
      setBidModalListing(null);
      setBidAmount('');
      fetchListings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredListings = listings.filter(l => {
    if (filter === 'all') return true;
    return l.listingType === filter;
  });

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-24 px-4 sm:px-6 lg:px-8 text-white relative">
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Project Marketplace</h1>
            <p className="text-gray-400">Buy, sell, or auction personal and team projects.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if(!isAuthenticated) { toast.error("Please log in first"); return; }
                setShowCreateModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              <Plus size={18} /> Create Listing
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            All Listings
          </button>
          <button 
            onClick={() => setFilter('sale')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filter === 'sale' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'}`}
          >
            <ShoppingCart size={16} /> Fixed Price
          </button>
          <button 
            onClick={() => setFilter('auction')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filter === 'auction' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'}`}
          >
            <Gavel size={16} /> Auctions
          </button>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-300">No listings found</h3>
            <p className="text-gray-500 mt-2">Be the first to sell a project!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map(listing => (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-3xl overflow-hidden border border-white/10 flex flex-col hover:border-white/20 transition-colors">
                {/* Image Placeholder */}
                <div className="h-48 bg-[#111] relative border-b border-white/10">
                  {listing.images && listing.images.length > 0 ? (
                    <img src={listing.images[0]} alt="Project" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">No Image Provided</div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    {listing.listingType === 'sale' ? (
                      <span className="bg-green-500/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">For Sale</span>
                    ) : (
                      <span className="bg-purple-500/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">Auction</span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    {listing.status === 'sold' && (
                      <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">SOLD</span>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold truncate pr-2" title={listing.title}>{listing.title}</h3>
                    <div className="flex shrink-0">
                      {listing.type === 'personal' ? (
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20 flex items-center gap-1"><User size={10} /> Personal</span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full border border-amber-500/20 flex items-center gap-1"><Users size={10} /> Team</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{listing.description}</p>
                  
                  <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    By <span className="text-gray-300">{listing.creatorName}</span>
                  </div>

                  {/* Pricing / Bidding info */}
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      {listing.listingType === 'sale' ? (
                        <>
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Price</div>
                          <div className="text-xl font-bold text-green-400">${listing.price}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-gray-500 uppercase tracking-wider flex items-center justify-between mb-1">
                            <span>Current Bid</span>
                            {listing.expiresAt && <Countdown expiresAt={listing.expiresAt} />}
                          </div>
                          <div className="text-xl font-bold text-purple-400">${listing.currentBid}</div>
                          {listing.highestBidder && <div className="text-[10px] text-gray-500">by {listing.highestBidder}</div>}
                        </>
                      )}
                    </div>
                    
                    <div>
                      {listing.status === 'active' && listing.creatorEmail !== user?.email ? (
                        listing.listingType === 'sale' ? (
                          <button onClick={() => setCheckoutListing(listing)} className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                            Buy Now
                          </button>
                        ) : (
                          <button onClick={() => handleBid(listing)} className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                            Place Bid
                          </button>
                        )
                      ) : listing.status === 'active' && listing.creatorEmail === user?.email ? (
                        <div className="text-xs text-gray-500 italic">Your Listing</div>
                      ) : (
                        <div className="text-xs text-red-400 font-bold uppercase">Sold</div>
                      )}
                    </div>
                  </div>
                  {listing.link && (
                    <a href={listing.link} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors">
                      <Globe size={14} /> View Demo Link
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                <h3 className="text-xl font-bold">List Project for Sale/Auction</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Project Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" placeholder="E.g., E-commerce Platform" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description (Full Details)</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 min-h-[100px]" placeholder="Describe your project, features, stack..." />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Image URL (Optional)</label>
                  <input type="text" value={imageLink} onChange={e => setImageLink(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Demo/Working Link (Optional)</label>
                  <input type="text" value={demoLink} onChange={e => setDemoLink(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" placeholder="https://..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Ownership</label>
                    <select value={projectType} onChange={e => setProjectType(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                      <option value="personal">Personal Project</option>
                      <option value="team">Team Project</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Listing Format</label>
                    <select value={listingType} onChange={e => setListingType(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                      <option value="sale">Fixed Price Sale</option>
                      <option value="auction">Auction</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    {listingType === 'sale' ? 'Price (DevCoins)' : 'Starting Bid (DevCoins)'}
                  </label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" placeholder="0" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleCreateListing} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-lg">List Project</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bid Amount Modal */}
      <AnimatePresence>
        {bidModalListing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setBidModalListing(null); setBidAmount(''); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel border border-white/10 rounded-2xl w-full max-w-sm relative z-10 overflow-hidden shadow-2xl bg-[#111]">
              <div className="p-6 border-b border-white/10 bg-black/40">
                <h3 className="text-lg font-bold text-white">Place a Bid</h3>
                <p className="text-sm text-gray-400 mt-1">Bidding on: {bidModalListing.title}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Current Bid: <span className="text-purple-400 font-bold">${bidModalListing.currentBid}</span></label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      placeholder={`Must be higher than ${bidModalListing.currentBid}`}
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-3">
                <button onClick={() => { setBidModalListing(null); setBidAmount(''); }} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={confirmBid} className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-lg">Confirm Bid</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutListing && (
          <PaymentModal 
            listing={checkoutListing} 
            onClose={() => setCheckoutListing(null)}
            onPay={(id) => {
              setCheckoutListing(null);
              handleBuy(id);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
