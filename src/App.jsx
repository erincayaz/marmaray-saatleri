import { useState, useEffect } from 'react'
import { Tooltip } from 'bootstrap'
import { stations } from './constant'
import { getNextTrainTime } from './trainTimes'
import removeAccents from 'remove-accents'
import './App.css'

export default function App() {
  const [selectedStation, setSelectedStation] = useState(null)
  const [selectedDirection, setSelectedDirection] = useState(null)
  const [trainTimes, setTrainTimes] = useState([])
  const directions = ['Gebze', 'Halkali']

  useEffect(() => {
    fetchTrainTimes()
  }, [selectedStation, selectedDirection])

  const fetchTrainTimes = () => {
    if (selectedStation && selectedDirection) {
      // Remove accents from input for internal processing
      const processedStation = removeAccents(selectedStation)
      const processedDirection = removeAccents(selectedDirection)
      
      const nextTrains = getNextTrainTime(processedStation, processedDirection)
      setTrainTimes(nextTrains)
    } else {
      setTrainTimes([])
    }
  }

  useEffect(() => {
    // Initialize Bootstrap tooltips
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipElements.forEach((el) => new Tooltip(el))
  }, [])

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="form-container p-5 shadow">
        <h1 className="mb-4 text-center">Marmaray Saatleri</h1>
        <div className="mb-3">
          <label htmlFor="station" className="form-label">Bulunduğunuz Durak</label>
          <select
            id="station"
            className="form-select"
            value={selectedStation || ''}
            onChange={(e) => setSelectedStation(e.target.value)}
          >
            <option value="">-- Seçiniz --</option>
            {stations.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="direction" className="form-label">Gidilecek Yön</label>
          <select
            id="direction"
            className="form-select"
            value={selectedDirection || ''}
            onChange={(e) => setSelectedDirection(e.target.value)}
          >
            <option value="">-- Seçiniz --</option>
            {directions.map((direction) => (
              <option key={direction} value={direction}>
                {direction}
              </option>
            ))}
          </select>
        </div>
        {trainTimes.length > 0 ? (
          <div className="mt-4">
            <h5 className="text-center">Next Trains</h5>
            <ul className="list-group">
              {trainTimes.map((time, index) => (
                <li key={index} className="list-group-item text-center">
                  {time}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 text-center text-muted">
            <p>Tren saatlerini görmek için bulunduğunuz durağı ve gidilecek yönü seçiniz.</p>
          </div>
        )}
      </div>
      <a
        href="https://github.com/erincayaz/marmaray-saatleri"
        target="_blank"
        rel="noopener noreferrer"
        className="github-icon"
        data-bs-toggle="tooltip"
        title="Öneriler ve hatalar için"
      >
        <i className="fab fa-github" style={{ fontSize: '30px', color: '#333' }}></i>
      </a>
    </div>
  )
}
