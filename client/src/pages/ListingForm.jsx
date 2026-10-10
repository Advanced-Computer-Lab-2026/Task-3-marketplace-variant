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

  // If there is an id, load the existing listing
  useEffect(() => {
    if (!id) return

    async function loadListing() {
      try {
        setError('')

        const res = await api.get(`/listings/${id}`)
        const listing = res.data.listing

        setForm({
          title: listing.title,
          description: listing.description || '',
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
          status: listing.status
        })
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load listing'
        )
      }
    }

    loadListing()
  }, [id])

  // Update the form when an input changes
  function onChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,

      // Allow the price field to temporarily be empty
      // while the user is typing.
      [name]:
        name === 'price'
          ? value === ''
            ? ''
            : Number(value)
          : value
    }))
  }

  // Create a new listing or update an existing one
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const data = {
        title: form.title,
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        description: form.description
      }

      if (id) {
        data.status = form.status

        await api.patch(`/listings/${id}`, data)
      } else {
        await api.post('/listings', data)
      }

      nav('/listings')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong'
      )
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'New'} Listing
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">

        {/* Title */}
        <div>
          <label className="block mb-1">
            Title
          </label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Calculus textbook"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1">
            Price
          </label>

          <input
            type="number"
            name="price"
            value={form.price}
            onChange={onChange}
            min="0"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1">
            Category
          </label>

          <select
            name="category"
            value={form.category}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="textbooks">
              Textbooks
            </option>

            <option value="electronics">
              Electronics
            </option>

            <option value="furniture">
              Furniture
            </option>

            <option value="clothing">
              Clothing
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className="block mb-1">
            Condition
          </label>

          <select
            name="condition"
            value={form.condition}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="new">
              New
            </option>

            <option value="like-new">
              Like New
            </option>

            <option value="used">
              Used
            </option>

            <option value="worn">
              Worn
            </option>
          </select>
        </div>

        {/* Status only appears when editing */}
        {id && (
          <div>
            <label className="block mb-1">
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="active">
                Active
              </option>

              <option value="sold">
                Sold
              </option>
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block mb-1">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Describe your item"
            rows="4"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          className="btn"
          type="submit"
        >
          Save
        </button>
      </form>
    </div>
  )
}