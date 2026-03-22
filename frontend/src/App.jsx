import { useState, useEffect, useCallback } from 'react'; 
import axios from 'axios';
import { AgGridReact, useGridFilter } from 'ag-grid-react'; 
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community'; 

ModuleRegistry.registerModules([AllCommunityModule]);


const FileUploadRenderer = (params) => {
  if (params.node.isRowPinned()) return null; 

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    axios.post(`http://localhost:5000/api/upload/${params.data.id}`, formData)
      .then(response => {
        params.node.setDataValue('file', response.data.record.file);
      })
      .catch(error => console.error("Error uploading file:", error));
  };

  if (params.value) {
    const fileUrl = `http://localhost:5000/${params.value}`;
    return (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', height: '100%' }}>
        <a href={fileUrl} target="_blank" rel="noreferrer" style={{ fontWeight: '600', color: '#4f46e5', textDecoration: 'none' }}>View File</a>
        <label className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>
          Replace
          <input type="file" accept=".pdf, .jpg, .jpeg" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
      </div>
    );
  }
  return <input type="file" accept=".pdf, .jpg, .jpeg" onChange={handleFileChange} style={{ fontSize: '13px', marginTop: '6px' }} />;
};


const DeleteButtonRenderer = (params) => {
  if (params.node.isRowPinned()) return null;

  return (
    <button 
      className="btn btn-danger"
      onClick={() => params.colDef.cellRendererParams.deleteRecord(params.data.id)}
    >
      Delete
    </button>
  );
};


const CategoryFilter = ({ model, onModelChange, getValue }) => {
  const doesFilterPass = useCallback((params) => {
    const cellCategory = getValue(params.node);
    return cellCategory === model; 
  }, [model, getValue]);

  useGridFilter({ doesFilterPass });

  const handleChange = (e) => {
    const newValue = e.target.value;
    onModelChange(newValue === "All" ? null : newValue); 
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'system-ui, sans-serif', width: '220px' }}>
      <div style={{ marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Filter by Category:</div>
      <select className="input-field" value={model || "All"} onChange={handleChange} style={{ width: '100%' }}>
        <option value="All">All Categories</option>
        <option value="A">Category A</option>
        <option value="B">Category B</option>
        <option value="C">Category C</option>
      </select>
    </div>
  );
};


function App() {
  const [rowData, setRowData] = useState([]);
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const defaultColDef = { filter: true, flex: 1 };
  

  const handleDeleteRecord = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      axios.delete(`http://localhost:5000/api/records/${id}`)
        .then(() => setRowData(prevData => prevData.filter(row => row.id !== id)))
        .catch(error => console.error("Error deleting record:", error));
    }
  };

  const [colDefs, setColDefs] = useState([
    { field: "name", headerName: "Company Name" },
    { 
      field: "amount", 
      headerName: "Amount ✎", 
      filter: false,
      editable: (params) => !params.node.isRowPinned(), 
      cellStyle: (params) => {
        if (params.node.isRowPinned()) return { fontWeight: '700', color: '#111827' }; 
        return { backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', cursor: 'text' };
      }
    },
    { 
      field: "category",
      filter: CategoryFilter, 
      valueGetter: (params) => {
        if (params.node.isRowPinned()) return params.data.category;
        const amount = params.data?.amount || 0; 
        if (amount >= 10000) return "A";
        if (amount >= 5000) return "B";
        return "C";
      },
      cellStyle: (params) => {
        if (params.node.isRowPinned()) return { fontWeight: '700', color: '#111827' };
        if (params.value === 'A') return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: '500' }; 
        if (params.value === 'B') return { backgroundColor: '#fef08a', color: '#854d0e', fontWeight: '500' }; 
        if (params.value === 'C') return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: '500' }; 
      }
    },
    { field: "file", headerName: "Document", cellRenderer: FileUploadRenderer, width: 250, filter: false },
    { 
      headerName: "Actions", 
      cellRenderer: DeleteButtonRenderer, 
      cellRendererParams: { deleteRecord: handleDeleteRecord }, 
      filter: false,
      width: 100,
      sortable: false
    }
  ]);

  useEffect(() => {
    document.body.style.backgroundColor = "#f3f4f6";
    document.body.style.margin = "0";

    axios.get('http://localhost:5000/api/records')
      .then(response => setRowData(response.data))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  const handleCellValueChanged = (event) => {
    if (event.colDef.field === 'amount') {
      const recordId = event.data.id;
      const newAmount = Number(event.newValue); 
      axios.put(`http://localhost:5000/api/records/${recordId}`, { amount: newAmount })
        .catch(error => console.error("Error saving updated amount:", error));
    }
  };

  const handleAddRecord = () => {
    if (!newName || !newAmount) {
      alert("Please enter both a name and an amount!");
      return;
    }
    axios.post('http://localhost:5000/api/records', { name: newName, amount: newAmount })
      .then(response => {
        setRowData([...rowData, response.data]);
        setNewName('');
        setNewAmount('');
      })
      .catch(error => console.error("Error adding record:", error));
  };

  const calculateTotals = (event) => {
    let sum = 0;
    let count = 0;
    event.api.forEachNodeAfterFilter((node) => {
      if (node.data && node.data.amount !== undefined) {
        sum += Number(node.data.amount);
        count++;
      }
    });

    const avg = count > 0 ? sum / count : 0;
    const newSum = sum;
    const newAvg = Math.round(avg * 100) / 100;

    setPinnedBottomRowData(prevData => {
      const newData = [
        { name: 'Total (SUM)', amount: newSum, category: '---', file: '' },
        { name: 'Average (AVG)', amount: newAvg, category: '---', file: '' }
      ];
      if (JSON.stringify(prevData) === JSON.stringify(newData)) return prevData; 
      return newData; 
    });
  };

  const clearAllFilters = () => {
    if (gridApi) {
      gridApi.setFilterModel(null); 
    }
  };
  
  return (
    <div className="app-container">
      <style>{`
        .app-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', system-ui, sans-serif; }
        .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); padding: 24px; border: 1px solid #e5e7eb; }
        .header-title { margin-top: 0; color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 24px; }
        .action-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 600; color: #4b5563; }
        .input-field { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: all 0.2s; outline: none; }
        .input-field:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15); }
        .btn { padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-success { background-color: #10b981; color: white; }
        .btn-success:hover { background-color: #059669; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); }
        .btn-outline { background-color: white; border: 1px solid #d1d5db; color: #374151; }
        .btn-outline:hover { background-color: #f3f4f6; border-color: #9ca3af; }
        .btn-danger { background-color: #fee2e2; color: #ef4444; padding: 6px 12px; font-size: 12px; border-radius: 4px; }
        .btn-danger:hover { background-color: #fecaca; }
        /* Customizing AG Grid border to match our card */
        .ag-theme-quartz { --ag-borders: none; --ag-header-background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
      `}</style>

      <div className="card">
        <h2 className="header-title">Financial Records Dashboard</h2>
        
        <div className="action-bar">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input 
                type="text" 
                className="input-field"
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                placeholder="e.g. Mega Corp"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input 
                type="number" 
                className="input-field"
                value={newAmount} 
                onChange={(e) => setNewAmount(e.target.value)} 
                placeholder="0.00"
                style={{ width: '130px' }}
              />
            </div>
            <button className="btn btn-success" onClick={handleAddRecord}>
              + Add Record
            </button>
          </div>

          <button className="btn btn-outline" onClick={clearAllFilters}>
            Clear Filters
          </button>
        </div>

        <div style={{ height: 450, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            pinnedBottomRowData={pinnedBottomRowData}
            onCellValueChanged={handleCellValueChanged}
            onModelUpdated={calculateTotals}
            onGridReady={(params) => setGridApi(params.api)} 
            theme={themeQuartz}
          />
        </div>
      </div>
    </div>
  );
}

export default App;