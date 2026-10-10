import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Sell an Item page.
// Routed at /listings/new (sell) and /listings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

const CATEGORIES = ['textbooks', 'electronics', 'furniture', 'clothing', 'other']
const CONDITIONS = ['new', 'like-new', 'used', 'worn']
const STATUSES = ['active', 'sold']

// 'like-new' -> 'Like new'
const label = (s) => (s.charAt(0).toUpperCase() + s.slice(1)).replace('-', ' ')

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the listing and copy only the editable fields into the form.
  useEffect(() => {
    if (!id) return
    let ignore = false
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
          description: l.description ?? ''
        })
      })
      .catch(err => {
        if (!ignore) setError(err?.response?.data?.message || 'Could not load listing')
      })
    return () => { ignore = true }
  }, [id])

  // Update the field whose `name` matches the input; keep price as a number.
  function onChange(e) {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }))
  }

  // POST a new listing, or PATCH the existing one when editing.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) {
        await api.patch('/listings/' + id, form)
      } else {
        await api.post('/listings', form)
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
        <input className="input" name="price" type="number" min="0" placeholder="Price" value={form.price} onChange={onChange} />
        <select className="input" name="category" value={form.category} onChange={onChange}>
          {CATEGORIES.map(c => <option key={c} value={c}>{label(c)}</option>)}
        </select>
        <select className="input" name="condition" value={form.condition} onChange={onChange}>
          {CONDITIONS.map(c => <option key={c} value={c}>{label(c)}</option>)}
        </select>
        {id && (
          <select className="input" name="status" value={form.status} onChange={onChange}>
            {STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        )}
        <textarea className="input" name="description" placeholder="Description (optional)" rows={3} value={form.description} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}