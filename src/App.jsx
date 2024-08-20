import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Importar axios para la solicitud HTTP
import './App.css';
import { db } from './firebase/firebase.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [productos, setProductos] = useState([]);
  const [categorias] = useState(['categoría 1', 'categoría 2', 'categoría 3']);
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [editando, setEditando] = useState(null);
  const [pokemon, setPokemon] = useState(null);  // Estado para los datos de Pikachu
  const [loadingPokemon, setLoadingPokemon] = useState(true);  // Estado de carga para Pokémon
  const [errorPokemon, setErrorPokemon] = useState(null);  // Estado para errores de Pokémon

  const productosCollectionRef = collection(db, 'productos');

  useEffect(() => {
    // Obtener productos de Firestore
    const obtenerProductos = async () => {
      const productosData = await getDocs(productosCollectionRef);
      setProductos(productosData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    obtenerProductos();
  }, []);

  useEffect(() => {
    // Obtener datos de Pikachu de la PokeAPI
    const fetchPokemon = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon/pikachu');
        setPokemon(response.data);
        setLoadingPokemon(false);
      } catch (err) {
        setErrorPokemon(err);
        setLoadingPokemon(false);
      }
    };

    fetchPokemon();
  }, []);

  const agregarProducto = async () => {
    if (!nombre || !cantidad || !precio || !categoria) return;

    const nuevoProducto = {
      nombre,
      cantidad: parseInt(cantidad),
      precio: parseFloat(precio),
      categoria,
    };

    const docRef = await addDoc(productosCollectionRef, nuevoProducto);
    setProductos([...productos, { ...nuevoProducto, id: docRef.id }]);
    setNombre('');
    setCantidad('');
    setPrecio('');
    setCategoria('');
  };

  const eliminarProducto = async (id) => {
    const productoDoc = doc(db, 'productos', id);
    await deleteDoc(productoDoc);
    setProductos(productos.filter((producto) => producto.id !== id));
  };

  const iniciarEdicion = (producto) => {
    setEditando(producto.id);
    setNombre(producto.nombre);
    setCantidad(producto.cantidad);
    setPrecio(producto.precio);
    setCategoria(producto.categoria);
  };

  const editarProducto = async () => {
    if (!nombre || !cantidad || !precio || !categoria) return;

    const productoDoc = doc(db, 'productos', editando);
    await updateDoc(productoDoc, {
      nombre,
      cantidad: parseInt(cantidad),
      precio: parseFloat(precio),
      categoria,
    });

    setProductos(
      productos.map((producto) =>
        producto.id === editando
          ? { ...producto, nombre, cantidad: parseInt(cantidad), precio: parseFloat(precio), categoria }
          : producto
      )
    );

    setEditando(null);
    setNombre('');
    setCantidad('');
    setPrecio('');
    setCategoria('');
  };

  const obtenerDatosGrafica = () => {
    const datosPorCategoria = categorias.map(cat => {
      const productosPorCategoria = productos.filter(prod => prod.categoria === cat);
      const cantidadTotal = productosPorCategoria.reduce((total, producto) => total + producto.cantidad, 0);
      return cantidadTotal;
    });

    return {
      labels: categorias,
      datasets: [
        {
          label: 'Cantidad de objetos',
          data: datosPorCategoria,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div>
      <h1>Inventario</h1>
      <div className='CrearProducto'>
        <input 
          type="text"
          placeholder="Nombre del producto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {editando ? (
          <button onClick={editarProducto}>Guardar cambios</button>
        ) : (
          <button className='AgregarBTN' onClick={agregarProducto}>Agregar</button>
        )}
      </div>

      <table border="1" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>{producto.cantidad}</td>
              <td>${parseFloat(producto.precio).toFixed(2)}</td> 
              <td>{producto.categoria}</td>
              <td>${(producto.cantidad * parseFloat(producto.precio)).toFixed(2)}</td>
              <td>
                <button onClick={() => iniciarEdicion(producto)}>Editar</button>
                <button onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '50px' }}>
        <h2>Objetos por categoria</h2>
        <Bar data={obtenerDatosGrafica()} />
      </div>

      {/* Mostrar Pikachu */}
      <div style={{ marginTop: '50px',
        backgroundColor: '#a5a562', // Fondo amarillo claro
        padding: '20px',           // Espaciado interno
        borderRadius: '8px',       // Bordes redondeados
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra suave
        textAlign: 'center'        // Centrar el texto y el contenido
      }}>
        <h2>Pikachu</h2>
        {loadingPokemon ? (
          <p>Loading Pikachu...</p>
        ) : errorPokemon ? (
          <p>Error: {errorPokemon.message}</p>
        ) : pokemon ? (
          <div>
            <h3>{pokemon.name.toUpperCase()}</h3>
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            <p>Height: {pokemon.height / 10} meters</p>
            <p>Weight: {pokemon.weight / 10} kg</p>
          </div>
        ) : (
          <p>No data</p>
        )}
      </div>
    </div>
  );
}

export default App;
