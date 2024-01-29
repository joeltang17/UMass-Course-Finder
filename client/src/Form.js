import React, { useState } from 'react';

const Form = () => {
  const [forms, setForms] = useState([{ id: '', classNum: ''}]);
  const [submittedData, setSubmittedData] = useState([]);

  const idInput = (index, value) => {
    const updatedForms = [...forms];
    updatedForms[index].id = value;
    setForms(updatedForms);
  };

  const classNumberInput = (index, value) => {
    const updatedForms = [...forms];
    updatedForms[index].classNum = value;
    setForms(updatedForms);
  };

  const addForm = () => {
    setForms([...forms, { id: '', classNum: '' }]);
  };

  const removeForm = (index) => {
    const updatedForms = [...forms];
    updatedForms.splice(index, 1);
    setForms(updatedForms);
  };

  const apiCall = async (endpoint) => {
    const res = await fetch(endpoint)
    const data = await res.json();
    return data
  }

  const parallelCall = async (endpoints) => {
    const calls = endpoints.map(apiCall)
    const res = await Promise.all(calls)
    return res;
  }

  const submit = async () => {

    let endpoints = []
    for(let i = 0; i < forms.length; i++){
      if(forms[i].id === ''){
        alert('Please fill all Professor ID forms')
        return
      }
      endpoints.push(`https://scrape-my-professor-0hgy.onrender.com/professor/${forms[i].id}/${forms[i].classNum}`)
    }
    const allData = await parallelCall(endpoints)
    setSubmittedData(allData) 
  }

  return (  
    <div>
      {forms.map((form, index) => (
        <div key={index}>
          <label>
            Professor ID:
            <input
              type="text"
              value={form.id}
              onChange={(e) => idInput(index, e.target.value)}
            />
          </label>
          <label>
            Class Number:
            <input
              type="text"
              value={form.classNum}
              onChange={(e) => classNumberInput(index, e.target.value)}
            />
          </label>
          <button type="button" onClick={() => removeForm(index)}>
            Remove Form
          </button>
        </div>
      ))}
      <button type="button" onClick={addForm}>
        Add Form
      </button>
      <button type="button" onClick={submit}>
        Submit All
      </button>

      {submittedData.length > 0 && (
        <table className='table'>
          <thead>
            <tr>
              <th>Professor ID</th>
              <th>Class Number</th> 
              <th>Name</th>
              <th>Number of Reviews</th>
              <th>Average Quality Rating</th>
              <th>Average Difficulty Rating</th>
            </tr>
          </thead>
          <tbody>
            {submittedData.map((data, index) => (
              <tr key={index}>
                <td>{data.id}</td>
                <td>{data.classNum}</td>
                <td>{data.name}</td>
                <td>{data.numReviews}</td>
                <td>{data.qualityAvg}</td>
                <td>{data.difficultyAvg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Form;
