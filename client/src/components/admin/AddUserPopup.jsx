import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

export default function AddUserPopup({ onClose, type, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    department: '',
    year: '',
    section: '',
    stream: '',
    enrollment_no: '',
    profile_pic: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, profile_pic: file }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (type === 'student') {
      if (!formData.department.trim()) newErrors.department = 'Department is required';
      if (!formData.year.trim()) newErrors.year = 'Year is required';
      if (!formData.section.trim()) newErrors.section = 'Section is required';
      if (!formData.stream.trim()) newErrors.stream = 'Stream is required';
      if (!formData.enrollment_no.trim()) newErrors.enrollment_no = 'Enrollment number is required';
    }
    
    if (type === 'teacher') {
      if (!formData.department.trim()) newErrors.department = 'Department is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            mobile: formData.mobile,
            department: formData.department,
            year: formData.year,
            section: formData.section,
            stream: formData.stream,
            enrollment_no: formData.enrollment_no,
            role: type,
            profile_pic_url: formData.profile_pic ? await uploadProfilePic(formData.profile_pic) : null
          }
        }
      });
      
      if (error) throw error;
      
      onSuccess();
    } catch (err) {
      console.error('Error creating user:', err);
      setErrors(prev => ({ ...prev, general: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadProfilePic = async (file) => {
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(`public/${Date.now()}_${file.name}`, file);
    
    if (error) throw error;
    
    return supabase.storage.from('profile-pictures').getPublicUrl(data.path).data.publicUrl;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        width: '400px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ marginBottom: '2rem' }}>{type === 'student' ? 'Add New Student' : 'Add New Teacher'}</h2>
        
        {errors.general && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#fecaca',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '5px',
                border: errors.name ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            {errors.name && <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{errors.name}</p>}
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '5px',
                border: errors.email ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            {errors.email && <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{errors.email}</p>}
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mobile</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '5px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '5px',
                border: errors.password ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            {errors.password && <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{errors.password}</p>}
          </div>
          
          {type === 'student' && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '5px',
                    border: errors.department ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                {errors.department && <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{errors.department}</p>}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '5px',
                    border: errors.year ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                {errors.year && <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{errors.year}</p>}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Section</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '5px',
                    border: errors.section ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                {errors.section && <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{errors.section}</p>}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Stream</label>
                <input
                  type="text"
                  name="stream"
                  value={formData.stream}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '5px',
                    border: errors.stream ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                {errors.stream && <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{errors.stream}</p>}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Enrollment No</label>
                <input
                  type="text"
                  name="enrollment_no"
                  value={formData.enrollment_no}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '5px',
                    border: errors.enrollment_no ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                {errors.enrollment_no && <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{errors.enrollment_no}</p>}
              </div>
            </>
          )}
          
          {type === 'teacher' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  border: errors.department ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              {errors.department && <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{errors.department}</p>}
            </div>
          )}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '5px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              background: isSubmitting ? '#4f46e5' : '#6366f1',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
        
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
