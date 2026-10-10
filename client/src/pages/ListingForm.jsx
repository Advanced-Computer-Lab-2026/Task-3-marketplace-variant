import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

const categories = [
  ['textbooks', 'Textbooks'],
  ['electronics', 'Electronics'],
  ['furniture', 'Furniture'],
  ['clothing', 'Clothing'],
  ['other', 'Other'],
]

const conditions = [
  ['new', 'New'],
  ['like-new', 'Like new'],
  ['used', 'Used'],
  ['worn', 'Worn'],
]

const statuses = [
  ['active', 'Active'],
  ['sold', 'Sold'],
]

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    api.get('/listings/' + id)
      .then(res => {
        if (cancelled) return
        const listing = res.data.listing
        setForm({
          title: listing.title,
          description: listing.description || '',
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
          status: listing.status,
        })
      })
      .catch(err => {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load listing')
      })
    return () => { cancelled = true }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? 0 : Number(value)) : value,
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = {
      title: form.title,
      description: form.description,
      price: form.price,
      category: form.category,
      condition: form.condition,
    }
    if (id) payload.status = form.status
    try {
      if (id) await api.patch('/listings/' + id, payload)
      else await api.post('/listings', payload)
      nav('/listings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <input
          className="input"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
        />
        <input
          className="input"
          name="price"
          type="number"
          min="0"
          placeholder="Price"
          value={form.price}
          onChange={onChange}
        />
        <select className="input" name="category" value={form.category} onChange={onChange}>
          {categories.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select className="input" name="condition" value={form.condition} onChange={onChange}>
          {conditions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {id && (
          <select className="input" name="status" value={form.status} onChange={onChange}>
            {statuses.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        )}
        <textarea
          className="input"
          name="description"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={onChange}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
