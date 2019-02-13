import React from 'react'
import ElementBox from '../containers/ElementBox'
import DataTable from './DataTable'
import Pagination from './Pagination'

 class TableBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      filter: "",
      sortKey: props.sortKey
    }
    this.setPage = this.setPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.setFilter = this.setFilter.bind(this);
  }
  setPage(page) {
    this.setState({ page });
  }
  previousPage() {
    const page = Math.max(0, this.state.page - 1);
    this.setState({ page });
  }
  nextPage() {
    const maxPages = Math.ceil(this.getFilteredData().length / this.props.pageSize);
    const page = Math.min(maxPages - 1, this.state.page + 1);
    this.setState({ page });
  }
  getFilteredData() {
    let filterKey = this.props.filterKey,
      filter = this.state.filter;
    if (!filter) return this.props.data;
    if (!filterKey.length) {
      filterKey = Object.keys(this.props.data[0])[0];
    }
    return this.props.data.filter(d => d[filterKey].toString().toLowerCase().includes(filter));
  }
  setFilter(e) {
    this.setState({ filter: e.target.value.toLowerCase() });
  }
  render() {
    const data = this.getFilteredData(),
      paginate = data.length > this.props.pageSize ? (
        <div className='controls-below-table'>
          <Pagination
            length={ data.length }
            page={ this.state.page }
            size={ this.props.pageSize }
            set={ this.setPage }
            prev={ this.previousPage }
            next={ this.nextPage }
          />
        </div>
    ) : null;
    const page = this.state.page,
      size = this.props.pageSize,
      tableData = data.slice(page * size, page * size + size);
    return (
      <ElementBox title={this.props.title} desc={this.props.desc}>
        { !this.props.showControls ? null :
          <div className="controls-above-table">
            <div className="row">
              <div className="col-sm-6">
                <form className="form-inline">
                  <input className="form-control form-control-sm bright"
                    onChange={ this.setFilter }
                    placeholder="Search" type="text" />
                </form>
              </div>
              <div className="col-sm-6">
                <form className="form-inline justify-content-sm-end">
                  <a className="btn btn-sm btn-secondary" href="#">Download CSV</a>
                </form>
              </div>
            </div>
          </div>
        }
        <div className="table-responsive">
          <DataTable tableData={ tableData }
            columns={ this.props.columns }
            links={ this.props.links }
            onClick={ this.props.onClick }/>
        </div>
        { paginate }
      </ElementBox>
    )
  }
}

TableBox.defaultProps = {
  pageSize: 13,
  data: [],
  columns: [],
  links: {},
  filterKey: "",
  onClick: null,
  showControls: true
}

export default TableBox;