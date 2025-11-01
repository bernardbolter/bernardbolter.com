'use client'

import React, { useState, useEffect } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider'
import Loading from '@/components/Loading'
import HeaderTitle from '../Info/HeaderTitle'
import CloseCircleSvg from '@/svgs/CloseCircleSvg'
import Link from 'next/link'
import LinkSvg from '@/svgs/LinkSvg'

export default function BasicForm() {
    const [artworks] = useArtworks()
    const [contactLoading, setContactLoading] = useState<boolean>(true)
    const [contactHTML, setContactHTML] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const [errors, setErrors] = useState<{name?: string; email?: string; message?: string}>({})
    const [submitError, setSubmitError] = useState<string>('')
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    console.log(artworks.contactData)

  const validateForm = () => {
    const newErrors: {name?: string; email?: string; message?: string} = {};
    
    // --- UPDATED VALIDATION LOGIC ---
    // The keys now refer to your i18n JSON structure (e.g., 'contact.error.nameRequired')

    if (!name.trim()) {
      // Use 't' to translate the string based on the key
      newErrors.name = "Name is required"
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!message.trim()) {
      newErrors.message = "Message is required"
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // ... (onSubmit function remains the same) ...
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    
    setSubmitError('');
    setSubmitSuccess(false);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    fetch("https://formcarry.com/s/BuS16rcQ__y", {
      method: 'POST',
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, message })
    })
    .then(response => response.json())
    .then(response => {
      if (response.code === 200) {
        setSubmitSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
        setErrors({});
      }
      else if(response.code === 422){
        // TRANSLATE the server error if possible, or fall back to an internal key
        setSubmitError("Form submission failed. Please check your data and try again.")
      }
      else {
        setSubmitError("An unknown server error occurred. Please try again.")
      }
    })
    .catch(() => {
      // TRANSLATE the catch-all error
      setSubmitError("A network error occurred. Please try again.");
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  }

  useEffect(() => {
    console.log(artworks.contactData?.content)
    if (artworks.contactData?.content) {
        setContactLoading(false)
        setContactHTML(artworks.contactData.content)
    }
  }, [artworks.contactData])

  if (contactLoading) return <Loading />

  return (
    <section className="contact__container">
        <HeaderTitle title="contact" large={true} />
        <Link
            href="/"
            className="contact__close-container"
        >
            <CloseCircleSvg />
            <p>close</p>
        </Link>
        <div 
            className="contact-info__container"
            dangerouslySetInnerHTML={{ __html: contactHTML }}
        />
    
        <div className="contact-form__container" id="contact-form">
          <form onSubmit={(e) => onSubmit(e)} noValidate>
              
              <div className={`formcarry-block ${errors.name ? 'has-error' : ''}`}>
              {/* Translate labels */}
              <label htmlFor="name">name</label> 
              <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({...errors, name: undefined});
                  }} 
                  id="name" 
                  placeholder="name"
                  className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className={`formcarry-block ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email">email</label>
              <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({...errors, email: undefined});
                  }} 
                  id="email" 
                  placeholder="email"
                  className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className={`formcarry-block ${errors.message ? 'has-error' : ''}`}>
              <label htmlFor="message">message</label>
              <textarea 
                  value={message} 
                  onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors({...errors, message: undefined});
                  }} 
                  id="message" 
                  placeholder="message"
                  className={errors.message ? 'error' : ''}
                  rows={5}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
              </div>
              
              <div className="formcarry-block">  
              <button type="submit" disabled={isSubmitting}>
                  {/* Translate button text */}
                  {isSubmitting ? "sending..." : "send message"} 
              </button>
              </div>
              
              {submitError && (
              <div className="alert alert-error">
                  <span className="alert-icon">⚠</span>
                  {submitError}
              </div>
              )}
              
              {submitSuccess && (
              <div className="alert alert-success">
                  <span className="alert-icon">✓</span>
                  {/* Translate success message */}
                  {"received your submission, thank you!"} 
              </div>
              )}
          </form>            
        </div>
        <div className="contact__bottom-info">
            <Link
                href="/datenschutz"
                className="contact__datenschutz"
            >
              <LinkSvg /> 
              Datenschutz
            </Link>
            <h1 className="contact__bottom--title">Impressum</h1>
            <div className="contact__bottom--line" />
            <h5>Bernard John Bolter IV</h5>
            <h5>Charlottenburgerstr. 8a</h5>
            <h5>14169 Berlin Germany</h5>
            <h5>bernardbolter@gmail.com</h5>
            <p>Kleinunternehmer im Sinne von § 19 Abs. 1 UStG wird die Umsatzsteuer nicht ausgewiesen.</p>
            <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter <a href="https://ec.europa.eu/consumers/odr/">[Link to the ODR Platform]</a> finden. Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen</p>
            <div className="contact__bottom--line" />
            <h5 className="contact__reserved">&copy; all rights reserved 1974 - {new Date().getFullYear()}</h5>
          </div>
    </section>
  );
}