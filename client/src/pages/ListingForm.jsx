import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Sell an Item page, routed at /listings/new (sell) and /listings/:id (edit),
// both wrapped in <ProtectedRoute>.

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

// Values must match the server's enums exactly.
const categories = [
  ['textbooks', 'Textbooks'],
  ['electronics', 'Electronics'],
  ['furniture', 'Furniture'],
  ['clothing', 'Clothing'],
  ['other', 'Other']
]
const conditions = [
  ['new', 'New'],
  ['like-new', 'Like new'],
  ['used', 'Used'],
  ['worn', 'Worn']
]
const statuses = [
  ['active', 'Active'],
  ['sold', 'Sold']
]

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the listing and copy only the editable fields into the form.
  useEffect(() => {
    if (!id) {
      setForm(defaults)
      return
    }
    let ignore = false
    api.get('/listings/' + id)
      .then(res => {
        if (ignore) return
        const l = res.data.listing
        setForm({
          title: l.title ?? '',
          price: l.price ?? 0,
          category: l.category ?? 'other',
          condition: l.condition ?? 'used',
          status: l.status ?? 'active',
          description: l.description ?? ''
        })
      })
      .catch(err => {
        if (!ignore) setError(err?.response?.data?.message || 'Could not load listing')
      })
    return () => { ignore = true }
  }, [id])

  // One handler for every input: the input's `name` says which field to update.
  function onChange(e) {
    const { name, value } = e.target
    // Keep price a number; an empty box stays '' so the user can clear and retype.
    const next = name === 'price' ? (value === '' ? '' : Number(value)) : value
    setForm(prev => ({ ...prev, [name]: next }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const { title, price, category, condition, description, status } = form
    // Never send `seller` — the server takes it from the token.
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
        <input className="input" name="title" placeholder="Title" value={form.title} onChange={onChange} />
        <input className="input" name="price" type="number" step="any" placeholder="Price" value={form.price} onChange={onChange} />
        <select className="input" name="category" value={form.category} onChange={onChange}>
          {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="input" name="condition" value={form.condition} onChange={onChange}>
          {conditions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {id && (
          <select className="input" name="status" value={form.status} onChange={onChange}>
            {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        )}
        <textarea className="input" name="description" rows="3" placeholder="Description (optional)" value={form.description} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
