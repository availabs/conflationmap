import React from 'react'

const PageItem = ({ index, page, set }) =>
  <li className={ "page-item" + (index === page ? " active" : "") }
    onClick={ set.bind(null, index) }>
    <a className="page-link">{ index + 1 }</a>
  </li>

export default ({ length, size, page, set, prev, next }) => {
  const maxPages = Math.ceil(length / size),
    pageItems = [];
  let min = Math.max(0, Math.min(Math.max(0, page - 5), maxPages - 10)),
    max = Math.min(maxPages, Math.max(Math.min(page + 5, maxPages), 10));
  for (let i = min; i < max; ++i) {
    pageItems.push(<PageItem key={ i } index={ i } page={ page } set={ set }/>);
  }
  return (
    <div className="pagination-w" style={{width: '100%'}}>
      <div className="pagination-info">
        Showing Records { size * page + 1 } - { Math.min(length, size * page + size) } of { length }
      </div>
      <div className="pagination-links">
        <ul className="pagination">
          <li className={ "page-item" + (page === 0 ? " disabled" : "") }
            onClick={ prev }>
            <a className="page-link">Previous</a>
          </li>
          { pageItems }
          <li className={ "page-item" + (page === (maxPages - 1) ? " disabled" : "") }
            onClick={ next }>
            <a className="page-link">Next</a>
          </li>
        </ul>
      </div>
    </div>
  )
}
