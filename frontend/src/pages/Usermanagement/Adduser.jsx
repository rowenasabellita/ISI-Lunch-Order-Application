function Adduser({ rowsData, deleteUserRows, handleChange }) {
  return rowsData.map((data, index) => {
    const { firstname, lastname, emailaddress, password, usertype } = data;

    return (
      <tr key={index}>
        <td>
          <input
            type="text"
            maxLength="50"
            value={firstname}
            onChange={(evnt) => handleChange(index, evnt)}
            name="firstname"
            className="form-control"
          />
        </td>
        <td>
          <input
            type="text"
            maxLength="50"
            value={lastname}
            onChange={(evnt) => handleChange(index, evnt)}
            name="lastname"
            className="form-control"
          />
        </td>
        <td>
          <input
            type="email"
            maxLength="50"
            value={emailaddress}
            onChange={(evnt) => handleChange(index, evnt)}
            name="emailaddress"
            className="form-control"
            id="email_address"
          />
        </td>
        <td>
          <input
            maxLength="20"
            type="text"
            value={password}
            onChange={(evnt) => handleChange(index, evnt)}
            name="password"
            className="form-control"
          />{" "}
        </td>{" "}
        <td>
          <select
            name="usertype"
            value={usertype}
            type="select"
            onChange={(evnt) => handleChange(index, evnt)}
          >
            <option value=""></option>
            <option id="1">Admin</option>
            <option id="2">Employee</option>
          </select>
        </td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => deleteUserRows(index)}
          >
            x
          </button>
        </td>
      </tr>
    );
  });
}

export default Adduser;
