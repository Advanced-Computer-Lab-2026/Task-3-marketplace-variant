
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  title: '',
  description: '',
  price: 0,
  category: 'other',
  condition: 'used',
  status: 'active'
}

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // TODO 3: Load the listing when editing
  useEffect(() => {
    if (!id) return

    async function loadListing() {
      try {
        setError('')

        const res = await api.get(`/listings/${id}`)
        const listing = res.data.listing ?? res.data

        setForm({
          title: listing.title ?? '',
          description: listing.description ?? '',
          price: Number(listing.price ?? 0),
          category: listing.category ?? 'other',
          condition: listing.condition ?? 'used',
          status: listing.status ?? 'active'
        })
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load listing'
        )
      }
    }

    loadListing()
  }, [id])

  // TODO 1: Update the form when an input changes
  function onChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      // keep '' while the box is empty so typing "-" or clearing it isn't clobbered to 0
      [name]: name === 'price' && value !== '' ? Number(value) : value
    }))
  }

  // TODO 2 and 3: Create or update a listing
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch(`/listings/${id}`, form)
      } else {
        // status is only editable on existing listings; new ones default to active
        const { status, ...body } = form
        await api.post('/listings', body)
      }

      nav('/listings')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save listing'
      )
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'New'} Listing
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="title" className="block mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="input w-full"
            value={form.title}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block mb-1">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            className="input w-full"
            value={form.price}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="input w-full"
            value={form.category}
            onChange={onChange}
          >
            <option value="textbooks">Textbooks</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="condition" className="block mb-1">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            className="input w-full"
            value={form.condition}
            onChange={onChange}
          >
            <option value="new">New</option>
            <option value="like-new">Like New</option>
            <option value="used">Used</option>
            <option value="worn">Worn</option>
          </select>
        </div>

        {id && (
          <div>
            <label htmlFor="status" className="block mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="input w-full"
              value={form.status}
              onChange={onChange}
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="description" className="block mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            className="input w-full"
            value={form.description}
            onChange={onChange}
            rows={4}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button className="btn" type="submit">
          Save
        </button>
      </form>
    </div>
  )
}
