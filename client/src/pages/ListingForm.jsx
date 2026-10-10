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

  // TODO (edit mode): when there is an `id`, load the listing and fill the form.
  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function loadListing() {
      try {
        const res = await api.get('/listings/' + id)
        if (cancelled) return
        const listing = res.data.listing
        setForm({
          title: listing.title || '',
          description: listing.description || '',
          price: Number(listing.price),
          category: listing.category,
          condition: listing.condition,
          status: listing.status
        })
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load listing')
      }
    }
    loadListing()
    return () => { cancelled = true }
  }, [id])

  // TODO: update `form` when an input changes (price should be a number).
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'price' ? (value === '' ? 0 : Number(value)) : value }))
  }

  // TODO: POST a new listing, or PATCH the existing one when editing,
  // then go back to /listings. Show the server's error message on failure.
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
      setError(err?.response?.data?.message || 'Could not save listing')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-medium">
          Title
          <input name="title" value={form.title} onChange={onChange} required minLength={2} className="input mt-1 w-full" />
        </label>
        <label className="block text-sm font-medium">
          Price
          <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} required className="input mt-1 w-full" />
        </label>
        <label className="block text-sm font-medium">
          Category
          <select name="category" value={form.category} onChange={onChange} className="input mt-1 w-full">
            <option value="textbooks">Textbooks</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Condition
          <select name="condition" value={form.condition} onChange={onChange} className="input mt-1 w-full">
            <option value="new">New</option>
            <option value="like-new">Like new</option>
            <option value="used">Used</option>
            <option value="worn">Worn</option>
          </select>
        </label>
        {id && (
          <label className="block text-sm font-medium">
            Status
            <select name="status" value={form.status} onChange={onChange} className="input mt-1 w-full">
              <option value="active">Active</option>
              <option value="sold">Sold</option>
            </select>
          </label>
        )}
        <label className="block text-sm font-medium">
          Description <span className="font-normal text-zinc-500">(optional)</span>
          <textarea name="description" value={form.description} onChange={onChange} rows="4" className="input mt-1 w-full" />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
