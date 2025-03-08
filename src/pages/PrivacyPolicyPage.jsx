import React, { useState } from 'react';

// Refined styles to match the Terms & Conditions page
const styles = {
  container: {
    backgroundColor: '#ffffff',
    color: '#222222',
    fontFamily: "'Times New Roman', serif",
    padding: '3rem',
    lineHeight: 1.8,
    maxWidth: '900px',
    margin: '0 auto',
    border: '1px solid #dddddd',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    fontSize: '2.2rem',
    fontWeight: 'bold',
    borderBottom: '2px solid #222',
    paddingBottom: '1rem',
  },
  section: {
    marginBottom: '2.5rem',
  },
  subHeader: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.2rem',
    borderLeft: '3px solid #222',
    paddingLeft: '0.8rem',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionContent: {
    paddingLeft: '1rem',
    paddingTop: '0.8rem',
  },
  list: {
    paddingLeft: '1.8rem',
    marginBottom: '1.2rem',
  },
  contactInfo: {
    padding: '1.5rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    textAlign: 'center',
    marginTop: '2rem',
  },
  updateInfo: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    textAlign: 'center',
    marginTop: '1.5rem',
  },
  arrow: {
    width: '16px',
    height: '16px',
    transition: 'transform 0.3s ease',
  },
  arrowRotated: {
    width: '16px',
    height: '16px',
    transform: 'rotate(180deg)',
    transition: 'transform 0.3s ease',
  }
};

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      title: '1. Introduction',
      content: `At GatiYan, we are committed to safeguarding your privacy and ensuring the security of your personal data. This Privacy Policy outlines the types of information we collect, the manner in which we use and protect such information, and your rights regarding your personal data when you access or use our cab service platform.`
    },
    {
      title: '2. Information Collection',
      content: `We collect various types of information to facilitate our services. This may include:
      - **Personal Identification Data:** Such as your name, contact details, and payment information.
      - **Usage Data:** Including ride history, booking details, and interactions with our website or mobile application.
      Data is collected via registration forms, ride bookings, and interactions with our customer support team.`
    },
    {
      title: '3. Use of Information',
      content: `The information collected is employed for the following purposes:
      - To facilitate and manage ride bookings.
      - To process payments securely.
      - To enhance and personalize our services.
      - To communicate updates, offers, and other pertinent information.
      - To ensure compliance with legal obligations and protect against fraud.
      We use your information solely for these purposes and in accordance with applicable legal standards.`
    },
    {
      title: '4. Information Sharing and Disclosure',
      content: `Your personal data will only be shared under the following circumstances:
      - With trusted service providers who assist in payment processing, customer support, or service delivery.
      - In response to legal requests or where required by law.
      - With your explicit consent.
      Under no circumstances do we sell or lease your personal information to third parties for marketing purposes.`
    },
    {
      title: '5. Data Security',
      content: `We implement robust security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. These measures include encryption protocols, secure storage, and regular security audits. Despite these measures, no method of electronic storage or transmission is entirely secure; however, we continuously strive to safeguard your information.`
    },
    {
      title: '6. Your Rights',
      content: `You retain the right to access, correct, or delete your personal data held by us. Additionally, you may object to or request the restriction of our processing of your information. To exercise these rights or for any privacy-related concerns, please contact our support team using the contact details provided below.`
    },
    {
      title: '7. Changes to This Privacy Policy',
      content: `This Privacy Policy may be updated periodically to reflect changes in our practices or regulatory requirements. Any modifications will be posted on our website along with the revised effective date. Continued use of our services following any updates constitutes your acceptance of the revised Privacy Policy.`
    }
  ];

  const toggleSection = (index) => {
    setActiveSection(activeSection === index ? null : index);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Privacy Policy</h1>

      {sections.map((section, index) => (
        <div key={index} style={styles.section}>
          <h2 
            style={styles.subHeader} 
            onClick={() => toggleSection(index)}
          >
            {section.title}
            <span style={activeSection === index ? styles.arrowRotated : styles.arrow}>
              ▼
            </span>
          </h2>
          
          {activeSection === index && (
            <div style={styles.sectionContent}>
              <p dangerouslySetInnerHTML={{ __html: section.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\s*-\s/g, '<br/>• ') }} />
            </div>
          )}
        </div>
      ))}

      <div style={styles.contactInfo}>
        <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>
          Contact Information
        </h3>
        <p>Phone: 7470320917</p>
        <p>Email: <a href="mailto:support.gatiyan@gatiyan.com" style={{color: '#222222', textDecoration: 'underline', fontWeight: 'bold'}}>
          support.gatiyan@gatiyan.com
        </a></p>
        <p>Address: Dhawari Satna, Madhya Pradesh</p>
      </div>

      <div style={styles.updateInfo}>
        <h4 style={{fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
          Last Updated: March 2025
        </h4>
        <p>
          Your continued use of our services signifies your acceptance of the terms outlined in this Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;