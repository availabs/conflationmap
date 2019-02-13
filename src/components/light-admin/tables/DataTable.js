import React from 'react'
import { Link } from 'react-router-dom'

export default ({ tableData=[], columns=[], links={}, onClick=null }) => {
  if (!tableData || tableData.length === 0) {
    return ('No Data Sento to table')
  }
  if (!columns.length) {
    columns = Object.keys(tableData[0])
  }
  return (
    <table className="table table-lightborder table-hover">
      <thead>
        <tr>
          { columns.map((col, i) => (<th key={ i }>{ col }</th>)) }
        </tr>
      </thead>
      <tbody>
        {
          tableData.map((row, i) => (
            <tr key={ i } onClick={ onClick ? onClick.bind(null, row) : null }>
              { columns.map((col, ii) => {
                  return (
                    (col in links) ?
                    <td key={ ii }>
                      <Link to={ links[col](row) }>{ row[col] }</Link>
                    </td>
                    : <td key={ ii }>{ row[col] }</td>
                  )
                })
              }
            </tr>
          ))
        }
      </tbody>
    </table>

  )
}

