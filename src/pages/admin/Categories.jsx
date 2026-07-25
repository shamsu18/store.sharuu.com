import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useStore } from '../../contexts/StoreContext';
import {
  makeId,
  slugify,
} from '../../lib/utils';
import { api } from '../../services/api';

const blank = {
  id: '',
  parentId: '',
  name: '',
  slug: '',
  description: '',
  image: '',
  active: true,
  showInMenu: true,
  sortOrder: '',
};

const sortByOrder = (a, b) =>
  Number(a.sortOrder || 0) -
    Number(b.sortOrder || 0) ||
  String(a.name || '').localeCompare(
    String(b.name || ''),
  );

export default function Categories() {
  const {
    categories,
    loadAdmin,
    adminLoaded,
    saveCategory,
    reorderCategories,
    deleteCategory,
  } = useStore();

  const [form, setForm] =
    useState(blank);
  const [saving, setSaving] =
    useState(false);
  const [reordering, setReordering] =
    useState(false);
  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!adminLoaded) {
      loadAdmin().catch(() => {});
    }
  }, [
    adminLoaded,
    loadAdmin,
  ]);

  const roots = useMemo(
    () =>
      categories
        .filter(item => !item.parentId)
        .sort(sortByOrder),
    [categories],
  );

  const childrenFor = parentId =>
    categories
      .filter(
        item =>
          String(item.parentId) ===
          String(parentId),
      )
      .sort(sortByOrder);

  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const siblings = categories.filter(
        item =>
          String(item.parentId || '') ===
          String(form.parentId || '') &&
          item.id !== form.id,
      );

      const nextOrder = form.sortOrder
        ? Math.max(
            1,
            Number(form.sortOrder),
          )
        : Math.max(
            0,
            ...siblings.map(item =>
              Number(item.sortOrder || 0),
            ),
          ) + 1;

      const saved =
        await saveCategory({
        ...form,
        id:
          form.id ||
          makeId('category'),
        slug:
          form.slug ||
          slugify(form.name),
        sortOrder: nextOrder,
      });

      const orderedSiblings = [
        ...siblings,
      ];

      orderedSiblings.splice(
        Math.min(
          nextOrder - 1,
          orderedSiblings.length,
        ),
        0,
        saved,
      );

      await reorderCategories(
        orderedSiblings.map(
          (item, index) => ({
            id: item.id,
            sortOrder: index + 1,
          }),
        ),
      );

      setForm(blank);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const upload = async event => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const uploaded =
      await api.uploadImages([file]);

    if (uploaded?.[0]) {
      setForm(previous => ({
        ...previous,
        image: uploaded[0].url,
      }));
    }
  };

  const moveCategory = async (
    siblings,
    categoryId,
    direction,
  ) => {
    const currentIndex =
      siblings.findIndex(
        item =>
          item.id === categoryId,
      );
    const nextIndex =
      currentIndex + direction;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= siblings.length
    ) {
      return;
    }

    const ordered = [...siblings];
    [
      ordered[currentIndex],
      ordered[nextIndex],
    ] = [
      ordered[nextIndex],
      ordered[currentIndex],
    ];

    setReordering(true);
    setError('');

    try {
      await reorderCategories(
        ordered.map((item, index) => ({
          id: item.id,
          sortOrder: index + 1,
        })),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setReordering(false);
    }
  };

  const renderRow = (
    item,
    siblings,
    index,
    child = false,
  ) => (
    <div
      className={`category-admin-row${child ? ' child' : ''}`}
      key={item.id}
    >
      <span className="category-order-number">
        {index + 1}
      </span>

      {item.image ? (
        <img
          src={item.image}
          alt=""
        />
      ) : (
        <span
          className="category-image-placeholder"
          aria-hidden="true"
        />
      )}

      <span className="category-admin-name">
        <strong>{item.name}</strong>
        <small>
          {item.slug}
          {item.active
            ? ''
            : ' · Inactive'}
        </small>
      </span>

      <span className="category-order-actions">
        <button
          type="button"
          className="icon-btn compact"
          onClick={() =>
            moveCategory(
              siblings,
              item.id,
              -1,
            )
          }
          disabled={
            reordering ||
            index === 0
          }
          aria-label={`Move ${item.name} up`}
          title="Move up"
        >
          <ArrowUp size={15} />
        </button>

        <button
          type="button"
          className="icon-btn compact"
          onClick={() =>
            moveCategory(
              siblings,
              item.id,
              1,
            )
          }
          disabled={
            reordering ||
            index ===
              siblings.length - 1
          }
          aria-label={`Move ${item.name} down`}
          title="Move down"
        >
          <ArrowDown size={15} />
        </button>
      </span>

      <button
        type="button"
        className="btn btn-light btn-small"
        onClick={() =>
          setForm({
            ...item,
            sortOrder:
              item.sortOrder || '',
          })
        }
      >
        Edit
      </button>

      <button
        type="button"
        className="icon-btn danger"
        onClick={() =>
          confirm(
            `Delete ${item.name}?`,
          ) &&
          deleteCategory(item.id)
        }
        aria-label={`Delete ${item.name}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">
            Navigation
          </span>
          <h1>
            Categories &amp;
            Subcategories
          </h1>
          <p>
            Use the arrow buttons to
            control the exact public
            display order.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="admin-grid-two wide-left">
        <section className="admin-panel">
          <h2>
            {form.id
              ? 'Edit'
              : 'Add'}{' '}
            Category
          </h2>

          <form
            className="stack-form"
            onSubmit={submit}
          >
            <label>
              Parent Category
              <select
                value={form.parentId}
                onChange={event =>
                  setForm({
                    ...form,
                    parentId:
                      event.target
                        .value,
                    sortOrder: '',
                  })
                }
              >
                <option value="">
                  None — Top Level
                </option>
                {roots
                  .filter(
                    item =>
                      item.id !==
                      form.id,
                  )
                  .map(item => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Name
              <input
                required
                value={form.name}
                onChange={event =>
                  setForm({
                    ...form,
                    name:
                      event.target
                        .value,
                    slug: form.id
                      ? form.slug
                      : slugify(
                          event.target
                            .value,
                        ),
                  })
                }
              />
            </label>

            <label>
              Slug
              <input
                value={form.slug}
                onChange={event =>
                  setForm({
                    ...form,
                    slug: slugify(
                      event.target.value,
                    ),
                  })
                }
              />
            </label>

            <label>
              Display Order
              <input
                min="1"
                type="number"
                value={form.sortOrder}
                placeholder="Added at the end automatically"
                onChange={event =>
                  setForm({
                    ...form,
                    sortOrder:
                      event.target
                        .value,
                  })
                }
              />
            </label>

            <label>
              Description
              <textarea
                rows="3"
                value={form.description}
                onChange={event =>
                  setForm({
                    ...form,
                    description:
                      event.target
                        .value,
                  })
                }
              />
            </label>

            <label>
              Image URL
              <input
                value={form.image}
                onChange={event =>
                  setForm({
                    ...form,
                    image:
                      event.target
                        .value,
                  })
                }
              />
            </label>

            <label className="btn btn-light">
              <ImagePlus size={16} />
              Upload Image
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={upload}
              />
            </label>

            {form.image && (
              <img
                className="category-preview"
                src={form.image}
                alt="Category preview"
              />
            )}

            <div className="check-grid">
              <label className="check-card">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={event =>
                    setForm({
                      ...form,
                      active:
                        event.target
                          .checked,
                    })
                  }
                />
                <span>Active</span>
              </label>

              <label className="check-card">
                <input
                  type="checkbox"
                  checked={
                    form.showInMenu
                  }
                  onChange={event =>
                    setForm({
                      ...form,
                      showInMenu:
                        event.target
                          .checked,
                    })
                  }
                />
                <span>
                  Show in Menu
                </span>
              </label>
            </div>

            <div className="button-row">
              <button
                className="btn btn-primary"
                disabled={saving}
              >
                <Plus size={16} />
                {saving
                  ? 'Saving...'
                  : 'Save Category'}
              </button>

              {form.id && (
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() =>
                    setForm(blank)
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-panel">
          <div className="subsection-heading">
            <div>
              <h2>Category Order</h2>
              <p className="category-order-help">
                Top-level categories and
                each subcategory group are
                ordered independently.
              </p>
            </div>
            {reordering && (
              <span className="saving">
                Updating...
              </span>
            )}
          </div>

          <div className="category-admin-list">
            {roots.map(
              (root, rootIndex) => {
                const children =
                  childrenFor(root.id);

                return (
                  <div
                    key={root.id}
                    className="category-admin-group"
                  >
                    {renderRow(
                      root,
                      roots,
                      rootIndex,
                    )}

                    {children.map(
                      (
                        child,
                        childIndex,
                      ) =>
                        renderRow(
                          child,
                          children,
                          childIndex,
                          true,
                        ),
                    )}
                  </div>
                );
              },
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
