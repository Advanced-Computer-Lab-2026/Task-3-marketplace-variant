import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await api.get(`/listings/${id}`)
        const data = res.data.listing || res.data
        setForm(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing')
      }
    }
    load()
  }, [id])

  function onChange(e) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      // Remove fields server rejects (like seller, createdAt, updatedAt, __v)
      const { seller, createdAt, updatedAt, __v, ...submitData } = form
      if (id) {
        await api.patch(`/listings/${id}`, submitData)
      } else {
        await api.post('/listings', submitData)
      }
      nav('/listings')
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            className="input w-full"
            placeholder="Calculus textbook"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={onChange}
            className="input w-full"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select name="category" value={form.category} onChange={onChange} className="input w-full">
            <option value="textbooks">textbooks</option>
            <option value="electronics">electronics</option>
            <option value="furniture">furniture</option>
            <option value="clothing">clothing</option>
            <option value="other">other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Condition</label>
          <select name="condition" value={form.condition} onChange={onChange} className="input w-full">
            <option value="new">new</option>
            <option value="like-new">like-new</option>
            <option value="used">used</option>
            <option value="worn">worn</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            className="input w-full h-24"
            placeholder="Describe your item..."
          />
        </div>

        {id && (
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select name="status" value={form.status} onChange={onChange} className="input w-full">
              <option value="active">active</option>
              <option value="sold">sold</option>
            </select>
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" type="submit">Save</button>
      </form>
    </div>
  )
}
