import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// TODO: build the Sell an Item page — see README.md "Your task".
// This page is already routed at /listings/new (sell) and /listings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the listing and copy only the editable fields into the form
  // (the response also has _id, seller, timestamps... which the server would reject).
  useEffect(() => {
    if (!id) return
    api.get(`/listings/${id}`)
      .then(({ data }) => {
        const { title, price, category, condition, status, description } = data.listing
        setForm({ title, price, category, condition, status, description: description || '' })
      })
      .catch(err => setError(err?.response?.data?.message || 'Could not load listing'))
  }, [id])

  // One handler for every field: the input's `name` says which key of `form` to update.
  function onChange(e) {
    const { name, value, type } = e.target
    setForm(f => ({ ...f, [name]: type === 'number' ? Number(value) : value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) {
        await api.patch(`/listings/${id}`, form)
      } else {
        // status is only editable on existing listings; a new one is always active
        const { status, ...data } = form
        await api.post('/listings', data)
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
        <input className="input" name="title" placeholder="Title" value={form.title} onChange={onChange} required />
        <input className="input" name="price" type="number" min="0" placeholder="Price" value={form.price} onChange={onChange} required />
        <select className="input" name="category" value={form.category} onChange={onChange}>
          <option value="textbooks">Textbooks</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
          <option value="other">Other</option>
        </select>
        <select className="input" name="condition" value={form.condition} onChange={onChange}>
          <option value="new">New</option>
          <option value="like-new">Like new</option>
          <option value="used">Used</option>
          <option value="worn">Worn</option>
        </select>
        {id && (
          <select className="input" name="status" value={form.status} onChange={onChange}>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
          </select>
        )}
        <textarea className="input" name="description" placeholder="Description (optional)" rows={3} value={form.description} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
