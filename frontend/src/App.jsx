import { useState, useEffect } from 'react';
import {
  fetchBoards,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  createList,
  deleteList,
} from './api';
import './App.css';

function App() {
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type, listId, card, lists }
  const [formData, setFormData] = useState({ title: '', description: '', new_list_id: '' });

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const { data } = await fetchBoards();
      setBoards(data);
      if (data.length > 0 && !activeBoard) {
        setActiveBoard(data[0]);
      } else if (data.length > 0 && activeBoard) {
        const updated = data.find((b) => b.id === activeBoard.id);
        setActiveBoard(updated || data[0]);
      }
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshBoard = async () => {
    try {
      const { data } = await fetchBoards();
      setBoards(data);
      if (activeBoard) {
        const updated = data.find((b) => b.id === activeBoard.id);
        setActiveBoard(updated || null);
      }
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
  };

  const handleAddCard = (listId) => {
    setFormData({ title: '', description: '' });
    setModal({ type: 'createCard', listId });
  };

  const handleEditCard = (card, listId) => {
    setFormData({ title: card.title, description: card.description || '' });
    setModal({ type: 'editCard', listId, card });
  };

  const handleDeleteCard = async (listId, cardId) => {
    if (!window.confirm('Delete this card?')) return;
    try {
      await deleteCard(listId, cardId);
      await refreshBoard();
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  const handleMoveCard = async (card, fromListId, newListId) => {
    if (newListId === fromListId) return;
    try {
      await moveCard(fromListId, card.id, newListId);
      await refreshBoard();
    } catch (err) {
      console.error('Failed to move card:', err);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.type === 'createCard') {
        await createCard(modal.listId, {
          title: formData.title,
          description: formData.description,
        });
      } else if (modal.type === 'editCard') {
        await updateCard(modal.listId, modal.card.id, {
          title: formData.title,
          description: formData.description,
        });
      } else if (modal.type === 'deleteList') {
        if (window.confirm('Delete this list and all its cards?')) {
          await deleteList(modal.boardId, modal.listId);
        } else {
          return;
        }
      }
      setModal(null);
      await refreshBoard();
    } catch (err) {
      console.error('Operation failed:', err);
    }
  };

  if (loading) return <div className="loading">Loading boards...</div>;

  if (!activeBoard) {
    return (
      <div className="empty-state">
        <p>No boards found. Seed data should have been loaded.</p>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <h1>📋 Kanban Board</h1>
        <div className="board-selector">
          {boards.length > 1 && (
            <select
              value={activeBoard.id}
              onChange={(e) => {
                const board = boards.find((b) => b.id === Number(e.target.value));
                setActiveBoard(board);
              }}
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          )}
          <span style={{ color: '#a0a0c0', fontSize: '0.9rem' }}>{activeBoard.name}</span>
        </div>
      </header>

      <div className="boards-grid">
        {activeBoard.lists &&
          activeBoard.lists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              boardId={activeBoard.id}
              allLists={activeBoard.lists || []}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onMoveCard={handleMoveCard}
              onDeleteList={setModal}
            />
          ))}
        <button
          className="add-list-btn"
          onClick={async () => {
            const name = prompt('List name:');
            if (name && name.trim()) {
              try {
                await createList(activeBoard.id, { name: name.trim() });
                await refreshBoard();
              } catch (err) {
                console.error('Failed to create list:', err);
              }
            }
          }}
        >
          + Add List
        </button>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {modal.type === 'createCard' && (
              <CardForm
                title="Add Card"
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleModalSubmit}
                onCancel={() => setModal(null)}
              />
            )}
            {modal.type === 'editCard' && (
              <CardForm
                title="Edit Card"
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleModalSubmit}
                onCancel={() => setModal(null)}
              />
            )}
            {modal.type === 'deleteList' && (
              <div>
                <h2>Delete List</h2>
                <p style={{ marginBottom: 16, color: '#a0a0c0' }}>
                  Are you sure you want to delete this list and all its cards?
                </p>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleModalSubmit}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ListColumn({ list, boardId, allLists, onAddCard, onEditCard, onDeleteCard, onMoveCard, onDeleteList }) {
  return (
    <div className="list-column">
      <div className="list-header">
        <h3>{list.name}</h3>
        <span className="card-count">{list.cards ? list.cards.length : 0}</span>
      </div>
      <div className="list-cards">
        {list.cards &&
          list.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              listId={list.id}
              allLists={allLists}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onMove={onMoveCard}
            />
          ))}
        {(!list.cards || list.cards.length === 0) && (
          <div style={{ padding: 20, textAlign: 'center', color: '#555577', fontSize: '0.85rem' }}>
            No cards yet
          </div>
        )}
      </div>
      <button className="add-card-btn" onClick={() => onAddCard(list.id)}>
        + Add Card
      </button>
      <button
        className="add-card-btn"
        style={{ margin: '0 10px 10px', borderColor: '#3d1f1f', color: '#e94560' }}
        onClick={() => onDeleteList({ type: 'deleteList', listId: list.id, boardId })}
      >
        Delete List
      </button>
    </div>
  );
}

function CardItem({ card, listId, allLists, onEdit, onDelete, onMove }) {
  return (
    <div className="card">
      <div className="card-title">{card.title}</div>
      {card.description && <div className="card-description">{card.description}</div>}
      <div className="card-actions">
        <button className="btn-edit" onClick={() => onEdit(card, listId)}>
          Edit
        </button>
        <button className="btn-delete" onClick={() => onDelete(listId, card.id)}>
          Delete
        </button>
        {allLists.length > 1 && (
          <select
            className="btn-move"
            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 4, border: 'none', background: '#1a2f1a', color: '#6bcb77', cursor: 'pointer' }}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onMove(card, listId, Number(e.target.value));
                e.target.value = '';
              }
            }}
          >
            <option value="" disabled>
              Move →
            </option>
            {allLists
              .filter((l) => l.id !== listId)
              .map((l) => (
                <option key={l.id} value={l.id}>
                  → {l.name}
                </option>
              ))}
          </select>
        )}
      </div>
    </div>
  );
}

function CardForm({ title, formData, setFormData, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit}>
      <h2>{title}</h2>
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          autoFocus
          placeholder="Card title"
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description"
        />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {title.includes('Add') ? 'Create' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default App;
