import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// The Sell an Item page, routed at /listings/new (sell) and /listings/:id (edit).
// Both routes are wrapped in <ProtectedRoute>, so we always have a token here.

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

// The values must match the server's Joi/Mongoose enums exactly; the labels are just for display.
const categories = [
  { value: 'textbooks', label: 'Textbooks' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'other', label: 'Other' }
]
const conditions = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like new' },
  { value: 'used', label: 'Used' },
  { value: 'worn', label: 'Worn' }
]
const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' }
]

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the listing and copy only the editable fields into the form.
  useEffect(() => {
    if (!id) { setForm(defaults); return }
    let ignore = false
    setError('')
    api.get('/listings/' + id)
      .then(res => {
        if (ignore) return
        const l = res.data.listing
        setForm({
          title: l.title,
          price: l.price,
          category: l.category,
          condition: l.condition,
          status: l.status,
          description: l.description || ''
        })
      })
      .catch(err => {
        if (!ignore) setError(err?.response?.data?.message || 'Could not load listing')
      })
    // Ignore a late response if the id changed or the page unmounted meanwhile.
    return () => { ignore = true }
  }, [id])

  // One handler for every input: the input's `name` says which field to update.
  function onChange(e) {
    const { name, value, type } = e.target
    // Store price as a number; keep '' while the field is cleared so the user can retype.
    const next = type === 'number' ? (value === '' ? '' : Number(value)) : value
    setForm(prev => ({ ...prev, [name]: next }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const { title, price, category, condition, description, status } = form
    // Never send `seller` — the server takes it from the token and rejects it in the body.
    const body = { title, price, category, condition, description }
    try {
      if (id) {
        await api.patch('/listings/' + id, { ...body, status })
      } else {
        await api.post('/listings', body)
      }
      nav('/listings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="title"
          placeholder="Title (e.g. Calculus textbook)"
          aria-label="Title"
          value={form.title}
          onChange={onChange}
        />
        <input
          className="input"
          type="number"
          name="price"
          placeholder="Price"
          aria-label="Price"
          step="any"
          value={form.price}
          onChange={onChange}
        />
        <select className="input" name="category" aria-label="Category" value={form.category} onChange={onChange}>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="input" name="condition" aria-label="Condition" value={form.condition} onChange={onChange}>
          {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {id && (
          <select className="input" name="status" aria-label="Status" value={form.status} onChange={onChange}>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        )}
        <textarea
          className="input"
          name="description"
          placeholder="Description (optional)"
          aria-label="Description"
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
