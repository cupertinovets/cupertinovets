import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Navbar from "../navbar/Navbar";

const ExportDataWithEditing = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem("mlMapData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const enhancedData = parsedData.map(item => ({
        ...item,
        verificationStatus: item.verificationStatus || 'not_started',
        minerType: item.minerType || 'unknown',
        comment: item.comment || '',
        photos: item.photos || []
      }));
      setData(enhancedData);
    }
    setIsLoading(false);
  }, []);

  const filteredData = data.filter(item =>
    item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
  );

  const handleStatusChange = (id, value) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, verificationStatus: value } : item
    ));
  };

  const handleTypeChange = (id, value) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, minerType: value } : item
    ));
  };

  const handleCommentChange = (id, value) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, comment: value } : item
    ));
  };

  const handlePhotoUpload = (id, files) => {
    const photos = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, photos } : item
    ));
  };

  const exportToExcel = () => {
    const excelData = data.map(item => ({
      ID: item.id,
      Адрес: item.address,
      'Статус проверки': getStatusLabel(item.verificationStatus),
      'Тип': getTypeLabel(item.minerType),
      'Комментарий': item.comment,
      'Фото': item.photos.map(p => p.name).join(', '),
      'Кол-во жителей': item.residents_count,
      'Среднее потребление': parseFloat(item.cons_avg).toFixed(1),
      'Общий объем': item.cons_total,
      'Вероятность': item.confidence
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Проверка майнеров");
    XLSX.writeFile(workbook, "miner_verification.xlsx");
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return 'Завершена';
      case 'in_progress': return 'В процессе';
      default: return 'Не начата';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'miner': return 'Майнер';
      case 'not_miner': return 'Не майнер';
      default: return 'Не открыл';
    }
  };

  if (isLoading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Загрузка данных...</p>
    </div>
  );

  return (
    <div className="export-data-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="header-section">
          <h2>Проверка подозрительной активности</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по адресу или ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Адрес</th>
                <th>Статус проверки</th>
                <th>Тип</th>
                <th>Комментарий</th>
                <th>Фото</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.address}</td>
                    <td>
                      <select
                        className={`status-select ${item.verificationStatus}`}
                        value={item.verificationStatus}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      >
                        <option value="not_started">Не начата</option>
                        <option value="in_progress">В процессе</option>
                        <option value="completed">Завершена</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className={`type-select ${item.minerType}`}
                        value={item.minerType}
                        onChange={(e) => handleTypeChange(item.id, e.target.value)}
                      >
                        <option value="unknown">Доступа нет</option>
                        <option value="miner">Коммерческий</option>
                        <option value="not_miner">Обычный</option>
                      </select>
                    </td>
                    <td>
                      <textarea
                        value={item.comment}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                        placeholder="Введите комментарий..."
                      />
                    </td>
                    <td>
                      <div className="photo-upload">
                        <label>
                          <span className="upload-btn">Загрузить фото</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(item.id, e.target.files)}
                          />
                        </label>
                        {item.photos.length > 0 && (
                          <div className="photo-list">
                            {item.photos.map((photo, idx) => (
                              <span key={idx} className="photo-name">{photo.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-data">
                  <td colSpan="6">
                    {searchTerm ? 'Ничего не найдено' : 'Нет данных для отображения'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="action-buttons">
          <button
            className="export-btn"
            onClick={exportToExcel}
            disabled={data.length === 0}
          >
            <span className="btn-icon"></span> Экспорт в Excel
          </button>
          

        </div>
      </div>
    </div>
  );
};

export default ExportDataWithEditing;