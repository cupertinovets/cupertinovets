import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Navbar from '../navbar/Navbar';

const ExportData = () => {
  const [exportType, setExportType] = useState('excel');

  const getStoredData = () => {
    const storedData = localStorage.getItem("mlMapData");
    if (!storedData) {
      alert("Нет данных для экспорта");
      return null;
    }
    return JSON.parse(storedData);
  };

  const getBuildingType = (code) => {
    switch (parseInt(code)) {
      case 0: return "Гараж";
      case 1: return "Дача";
      case 2: return "Многоквартирный";
      case 3: return "Прочий";
      case 5: return "Частный";
      default: return "Неизвестно";
    }
  };

  const exportToExcel = () => {
    const data = getStoredData();
    if (!data) return;

    const excelData = data.map(row => ({
      ID: row.id,
      Адрес: row.address,
      "Кол-во жителей": row.residents_count,
      "Тип здания": getBuildingType(row.building_type),
      "Среднее потребление": parseFloat(row.cons_avg).toFixed(1),
      "Общий объем": row.cons_total,
      "Вероятность": row.confidence
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Подозрительная активность");
    
    XLSX.writeFile(workbook, "suspicious_activity_report.xlsx");
  };

  const exportToCSV = () => {
    const data = getStoredData();
    if (!data) return;

    const headers = [
      "ID", "Адрес", "Кол-во жителей", "Тип здания", 
      "Среднее потребление", "Общий объем", "Вероятность"
    ];

    const csvRows = data.map(row => [
      row.id,
      `"${row.address}"`,
      row.residents_count,
      getBuildingType(row.building_type),
      parseFloat(row.cons_avg).toFixed(1),
      row.cons_total,
      row.confidence
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'suspicious_activity_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (exportType === 'excel') {
      exportToExcel();
    } else {
      exportToCSV();
    }
  };

  return (
    <div>
        <Navbar />
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <h2>Экспорт данных</h2>
        
        <div style={{ marginBottom: '20px' }}>
            <label>
            <input 
                type="radio" 
                value="excel" 
                checked={exportType === 'excel'} 
                onChange={() => setExportType('excel')} 
            />
            Excel (.xlsx)
            </label>
            
            <label style={{ marginLeft: '15px' }}>
            <input 
                type="radio" 
                value="csv" 
                checked={exportType === 'csv'} 
                onChange={() => setExportType('csv')} 
            />
            CSV (.csv)
            </label>
        </div>
        
        <button 
            onClick={handleExport}
            style={{
            padding: '10px 20px',
            backgroundColor: '#23538F',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
            }}
        >
            Экспортировать данные
        </button>
        </div>
    </div>
  );
};

export default ExportData;