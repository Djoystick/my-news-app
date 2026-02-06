import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';
import { Button, Input, List, Cell } from '@telegram-apps/telegram-ui';

import {
  findUserByUsernameOrId,
  setUserRole,
  type UserProfile,
} from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const AdminPage: FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    try {
      const results = await findUserByUsernameOrId(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  async function handleSetRole(userId: number, role: 'user' | 'editor' | 'admin') {
    try {
      await setUserRole(userId, role);
      setSelectedUser(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Error setting role:', err);
    }
  }

  if (!user || user.role !== 'admin') {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Только админы</div>;
  }

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <Input
          placeholder="Поиск по username или ID"
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onSubmit={handleSearch}
        />
        <Button onClick={handleSearch} size="s">
          🔍
        </Button>
      </div>

      {selectedUser && (
        <div
          style={{
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px',
          }}
        >
          <h3>
            {selectedUser.first_name} (@{selectedUser.username})
          </h3>
          <p>
            Текущая роль: <strong>{selectedUser.role}</strong>
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button onClick={() => handleSetRole(selectedUser.id, 'user')} size="s">
              👤 User
            </Button>
            <Button onClick={() => handleSetRole(selectedUser.id, 'editor')} size="s">
              ✏️ Editor
            </Button>
            <Button onClick={() => handleSetRole(selectedUser.id, 'admin')} size="s">
              👑 Admin
            </Button>
          </div>
        </div>
      )}

      {searchResults.length > 0 && (
        <>
          <h3>Результаты поиска:</h3>
          <List>
            {searchResults.map((result) => (
              <Cell
                key={result.id}
                onClick={() => setSelectedUser(result)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <strong>
                    {result.first_name} (@{result.username})
                  </strong>
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    Роль: {result.role}
                  </p>
                </div>
              </Cell>
            ))}
          </List>
        </>
      )}
    </div>
  );
};

