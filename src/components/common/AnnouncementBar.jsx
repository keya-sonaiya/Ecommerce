import React from 'react';
import './AnnouncementBar.css';

export function AnnouncementBar() {
  return (
    <div className="announcement-bar" role="region" aria-label="Announcement">
      <div className="container">
        <p className="announcement-text">
          Complimentary shipping on orders above ₹2,999.
        </p>
      </div>
    </div>
  );
}

export default AnnouncementBar;

