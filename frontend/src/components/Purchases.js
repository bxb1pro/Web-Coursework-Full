import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTransactionsByCustomer } from '../features/transactions/transactionSlice';
import { fetchGameById } from '../features/games/gamesSlice';

function Purchases() {
  // useDispatch is hook to dispatch actions (async or synchronous) to Redux store to change the state
  const dispatch = useDispatch();
  // useSelector is hook to retrieve state from Redux, and re-render if state changes
  const { transactions, status, error } = useSelector(state => state.transactions);
  const { customerId } = useSelector(state => state.auth);

  // useState adds local state to manage state in functions
  const [enrichedTransactions, setEnrichedTransactions] = useState([]);

  // First useEffect executes when component mounts or customerId changes, gets transaction data and sets it to enriched transactions
  useEffect(() => {
    if (customerId) {
      dispatch(fetchTransactionsByCustomer(customerId))
        .unwrap()
        .then(data => {
          setEnrichedTransactions(data.map(transaction => ({
            ...transaction,
            game: null
          })));
        })
        .catch((error) => console.error("Fetching transactions failed:", error));
    }
  }, [dispatch, customerId]);

  // Second useEffect iterates over enriched transactions to fetch relevant game details via fetchgamebyid function, updates transactions with full details
  useEffect(() => {
    enrichedTransactions.forEach((transaction, index) => {
      if (transaction.gameId && !transaction.game) {
        dispatch(fetchGameById(transaction.gameId))
          .unwrap()
          .then(gameData => {
            const updatedTransactions = [...enrichedTransactions];
            updatedTransactions[index].game = gameData;
            setEnrichedTransactions(updatedTransactions);
          })
          .catch(error => console.error("Fetching game data failed:", error));
      }
    });
  }, [transactions, dispatch, enrichedTransactions]);

  if (status === 'loading') return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mt-5">
      <h2>Purchase History</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Game</th>
            <th>Price</th>
            <th>Purchase Date</th>
          </tr>
        </thead>
        <tbody>
          {enrichedTransactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.game ? transaction.game.name : 'No game info'}</td>
              <td>£{transaction.amount.toFixed(2)}</td>
              <td>{new Date(transaction.transactionDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Purchases;
