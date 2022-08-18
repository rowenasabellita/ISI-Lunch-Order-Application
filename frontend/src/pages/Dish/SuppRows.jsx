import suppCSS from "./Supplier.module.css";

function SuppRows({ rowsData, deleteSuppRows, handleChange }) {
  return rowsData.map((data, index) => {
    const { supplier_name } = data;
    return (
      <tr key={index}>
        <td className={suppCSS.addSupp}>
          <input
            type="text"
            maxLength="50"
            value={supplier_name}
            onChange={(evnt) => handleChange(index, evnt)}
            name="supplier_name"
          />
        </td>
        <td className={suppCSS.addBool}>
          <form>
            <div onChange={(evnt) => handleChange(index, evnt)}>
              <div className={suppCSS.mainFree}>
                <input
                  type="radio"
                  maxLength="50"
                  value={true}
                  name="main_dish_free"
                />
                true
              </div>
              <div className={suppCSS.mainFree}>
                <input
                  type="radio"
                  maxLength="50"
                  value={false}
                  name="main_dish_free"
                />
                false
              </div>
            </div>
          </form>
        </td>
        <td className={suppCSS.addBool}>
          <form>
            <div onChange={(evnt) => handleChange(index, evnt)}>
              <div className={suppCSS.sideFree}>
                <input
                  type="radio"
                  maxLength="50"
                  value={true}
                  name="side_dish_free"
                />
                true
              </div>
              <div className={suppCSS.sideFree}>
                <input
                  type="radio"
                  maxLength="50"
                  value={false}
                  name="side_dish_free"
                />
                false
              </div>
            </div>
          </form>
        </td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => deleteSuppRows(index)}
          >
            x
          </button>
        </td>
      </tr>
    );
  });
}
export default SuppRows;
