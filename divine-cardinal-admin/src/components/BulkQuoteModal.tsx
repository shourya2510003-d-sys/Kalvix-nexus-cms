

import React, { useState } from 'react';

export default function BulkQuoteModal({ itemName }: { itemName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi Divine Cardinal! I would like to request a bulk quote for *${itemName}*.%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone}%0A*Quantity Required:* ${formData.quantity}%0A*Message:* ${formData.message}`;
    
    const defaultPhone = '918077977461';
    window.open(`https://wa.me/${defaultPhone}?text=${text}`, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="w-full mt-3 bg-white border border-luxury-gold/50 hover:bg-luxury-gold/5 text-luxury-gold py-3 text-xs uppercase tracking-widest transition-colors font-serif"
      >
        Request Bulk Quote
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-luxury-gold/20 shadow-2xl max-w-md w-full relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-8 space-y-6 text-left">
              <div className="text-center space-y-2">
                <h3 className="font-serif text-2xl text-luxury-charcoal">Request Bulk Quote</h3>
                <p className="text-xs uppercase tracking-widest text-luxury-gold font-serif">For {itemName}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required type="text" placeholder="Full Name" className="w-full border border-luxury-gold/30 rounded p-2.5 text-sm outline-none focus:border-luxury-gold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="email" placeholder="Email Address" className="w-full border border-luxury-gold/30 rounded p-2.5 text-sm outline-none focus:border-luxury-gold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input required type="tel" placeholder="Phone Number" className="w-full border border-luxury-gold/30 rounded p-2.5 text-sm outline-none focus:border-luxury-gold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input required type="text" placeholder="Quantity Required (e.g. 10 kg, 50 liters)" className="w-full border border-luxury-gold/30 rounded p-2.5 text-sm outline-none focus:border-luxury-gold" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                <textarea required placeholder="Any specific requirements?" rows={3} className="w-full border border-luxury-gold/30 rounded p-2.5 text-sm outline-none focus:border-luxury-gold resize-none" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                <button type="submit" className="w-full bg-luxury-gold hover:bg-[#b8933a] text-white py-3 text-xs uppercase tracking-widest font-serif transition-colors mt-2">
                  Send to WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
