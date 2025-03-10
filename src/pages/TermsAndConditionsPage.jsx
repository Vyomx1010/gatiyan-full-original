import React from 'react';
import Navbar from '../components/Landing/Navbar';
// Refined styles with improved typography and spacing
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
  },
  list: {
    paddingLeft: '1.8rem',
    marginBottom: '1.2rem',
  },
  listItem: {
    marginBottom: '0.5rem',
  },
  link: {
    color: '#222222',
    textDecoration: 'underline',
    fontWeight: 'bold',
  },
  contactInfo: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  }
};

const TermsAndConditionsPage = () => {
  return (
    <>
    <Navbar />
    <div style={styles.container}>
      <h1 style={styles.header}>Terms &amp; Conditions</h1>
      
      {/* Introduction */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Introduction</h2>
        <p>
          Welcome to our website. These Terms and Conditions govern your use of our cab services and website. Your continued use of our services constitutes your full acceptance of these terms. We urge you to carefully review the following provisions prior to engaging with our service. Should you disagree with any portion of these terms, please refrain from utilizing our offerings.
        </p>
      </section>
      
      {/* Definitions */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Definitions</h2>
        <p>
          In these Terms and Conditions, the following definitions apply:
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>"Company"</strong> refers to the service provider offering cab services.
          </li>
          <li style={styles.listItem}>
            <strong>"User"</strong> refers to any individual or entity accessing or using the website and its services.
          </li>
          <li style={styles.listItem}>
            <strong>"Service"</strong> encompasses the cab booking, transportation, and ancillary services provided by the Company.
          </li>
        </ul>
      </section>
      
      {/* Booking and Payment */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Booking and Payment</h2>
        <ol style={styles.list}>
          <li style={styles.listItem}>Rides may only be booked through our official website.</li>
          <li style={styles.listItem}>The fare, as displayed prior to booking, is fixed and non-negotiable upon confirmation.</li>
          <li style={styles.listItem}>
            Should the journey exceed the pre-booked parameters, adjustments to the fare will be effected. Any increase shall be communicated via telephone or written message.
          </li>
          <li style={styles.listItem}>
            A booking shall be deemed confirmed only upon receipt of a confirmation notification via SMS, telephone call, or email.
          </li>
          <li style={styles.listItem}>
            Fares are computed based on the distance traversed, time consumed, and applicable surcharges, including waiting time and tolls.
          </li>
          <li style={styles.listItem}>
            Payment modalities include cash, UPI, credit/debit cards, and various online payment gateways.
          </li>
        </ol>
      </section>
      
      {/* Cancellation and Refunds */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Cancellation and Refunds</h2>
        <ol style={styles.list}>
          <li style={styles.listItem}>
            Cancellations may be effected prior to the driver's arrival at the designated pickup location.
          </li>
          <li style={styles.listItem}>
            Full refunds shall be processed if a cancellation occurs before dispatch. In instances where the cancellation is initiated post-dispatch, a nominal cancellation fee may be imposed.
          </li>
          <li style={styles.listItem}>
            Refunds (if applicable) will be processed within two business days.
          </li>
        </ol>
      </section>
      
      {/* User Responsibilities */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>User Responsibilities</h2>
        <ol style={styles.list}>
          <li style={styles.listItem}>
            Users must furnish accurate and current personal, pickup, and drop-off details during the booking process.
          </li>
          <li style={styles.listItem}>
            It is incumbent upon the user to be present at the agreed pickup location at the stipulated time.
          </li>
          <li style={styles.listItem}>
            Users are expected to conduct themselves in a courteous and lawful manner towards drivers and fellow passengers.
          </li>
          <li style={styles.listItem}>
            Any damage to the vehicle attributable to the user shall incur additional charges.
          </li>
          <li style={styles.listItem}>
            Users shall not employ the service for any illicit or prohibited activities.
          </li>
          <li style={styles.listItem}>
            The Company is not liable for any loss of personal belongings left within the cab.
          </li>
        </ol>
      </section>
      
      {/* Driver Obligations */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Driver Obligations</h2>
        <ol style={styles.list}>
          <li style={styles.listItem}>
            Drivers are required to possess a valid driving license and adhere to all local traffic regulations.
          </li>
          <li style={styles.listItem}>
            A professional and respectful demeanor is expected at all times.
          </li>
          <li style={styles.listItem}>
            Vehicles must be maintained in a clean, safe, and roadworthy condition.
          </li>
          <li style={styles.listItem}>
            Drivers must not charge fees in excess of the system-calculated fare and must promptly report any disputes or accidents to the Company.
          </li>
        </ol>
      </section>
      
      {/* Intellectual Property */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Intellectual Property</h2>
        <p>
          All content on this website, including text, graphics, logos, and images, is the exclusive property of the Company and is protected under applicable copyright laws. No portion of this material may be reproduced or distributed without the prior written consent of the Company.
        </p>
      </section>
      
      {/* Limitation of Liability */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, the Company shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use of our services, including but not limited to loss of profits, data, or goodwill.
        </p>
      </section>
      
      {/* Indemnification */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Indemnification</h2>
        <p>
          Users agree to indemnify, defend, and hold harmless the Company, its affiliates, and their respective officers and employees from any claims, losses, damages, or liabilities arising out of or related to the use of our services or any violation of these Terms.
        </p>
      </section>
      
      {/* Governing Law and Dispute Resolution */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Governing Law and Dispute Resolution</h2>
        <p>
          These Terms and Conditions shall be governed by and construed in accordance with the laws applicable in the relevant jurisdiction. Any disputes arising out of these Terms shall be resolved through amicable negotiations; failing which, the disputes shall be submitted to the competent courts.
        </p>
      </section>
      
      {/* Force Majeure and Severability */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Force Majeure and Severability</h2>
        <p>
          The Company shall not be held responsible for any failure to perform its obligations due to circumstances beyond its reasonable control, including natural disasters, acts of government, or other events of force majeure. Should any provision of these Terms be deemed invalid or unenforceable, the remaining provisions shall continue in full force and effect.
        </p>
      </section>
      
      {/* Modifications to Terms */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Modifications to Terms</h2>
        <p>
          The Company reserves the right to modify, suspend, or discontinue any aspect of the service at any time. All changes will be communicated via our website or mobile application. Continued use of the service following any modifications constitutes acceptance of the revised terms.
        </p>
      </section>
      
      {/* Notices */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Notices</h2>
        <p>
          All notices, requests, and communications under these Terms shall be in writing and deemed to have been duly given when delivered by electronic mail or postal mail to the addresses provided herein.
        </p>
      </section>
      
      {/* Contact Details & Customer Support */}
      <section style={styles.section}>
        <h2 style={styles.subHeader}>Contact Details &amp; Customer Support</h2>
        <div style={styles.contactInfo}>
          <p>Telephone: 7470320917</p>
          <p>
            Email: <a style={styles.link} href="mailto:support.gatiyan@gatiyan.com">support.gatiyan@gatiyan.com</a>
          </p>
          <p>Address: Dhawari, Satna, Madhya Pradesh</p>
        </div>
      </section>
    </div>
    </>
  );
};

export default TermsAndConditionsPage;