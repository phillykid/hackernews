
import React, { Component } from 'react';
import axios from 'axios';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import ReactTable from "react-table";
import "react-table/react-table.css";import Grid from '@material-ui/core/Grid';

import Button  from '@material-ui/core/Button'

import './App.css';

import logo from './assets/images/Anonymous_hacker_logo.png'
import github from './assets/images/github.svg'
import email from './assets/images/email.png'
import linkedin from './assets/images/linkedin.png'

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

let total_pages=0;
let total_hits=0;



const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};



class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result) {
    const { hits, page, nbHits } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      },
      isLoading: false
    });
    console.log(result);  
    console.log(page);  
    console.log(nbHits);  
    total_hits=nbHits;
    console.log(total_hits/10)



  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }));
    }

  componentDidMount() {
    this._isMounted = true;

    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }

    event.preventDefault();
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render() {
    const {
      searchTerm,
      results,
      searchKey,
      error,
      isLoading,
      sortKey,
      isSortReverse
    } = this.state;

    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
    ) || 0;

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

    return (
      <div className="container">
      <div className="page">
       <div className="social-header">
                    <a href="https://github.com/phillykid">
                        <img className="social-icon" src={github}/></a>
                    <a href="https://www.linkedin.com/in/phillycoder/">
                        <img className="social-icon" src={linkedin}/></a>
                    <a href="mailto:lopezl@lafayette.edu">
                        <img className="social-icon" src={email}/></a>

                </div>
                <div className="Header">
                    <h1 id="logo-text">
                        Hackernews Clone Example</h1>
                        <div className="App">
                    <img className="App-logo" src={logo}/>
                    </div>
                </div>

                      

                          
        <div className="search">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <div className="interactions">
        { error
          ? <div className="interactions">
            <p>Something went wrong.</p>
          </div>
          : <ReactTable
          data={list}
          columns={[
            {
              Header: "Articles",
              columns: [
                {
                  Header: "Title",
                  accessor: "title",
                  minWidth: 400,
                  link: "url"
                },
                {
                  Header: "Author",
                  accessor: "author"
                },
                {
                  Header: "#Comments",
                  accessor: "num_comments"
                },
                {
                  Header: "Points",
                  accessor: "points",
                 
                }
              ]
            }
          ]}
          manual // Forces table not to paginate or sort automatically, so we can handle it server-side
          data={list}
          pages={Math.ceil(total_hits/10)} // Display the total number of pages
          loading={isLoading} // Display the loading overlay when we need it
          filterable
          defaultPageSize={10}
          className="-striped -highlight"
        />
        }
        </div>
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
            More
          </ButtonWithLoading>
        </div>
      </div>
      </div>


    );
  }
}

const Search = ({
  value,
  onChange,
  onSubmit,
  children
}) =>
  <form onSubmit={onSubmit}>
    <input
      type="text"
      value={value}
      onChange={onChange}
    />
    <div className="search-button">
    <Button type="submit"
    style={{ fontSize: '2vw' }}>
      {children}
    </Button>
    </div>
  </form>

const TableSorted = ({
  list,
  sortKey,
  isSortReverse,
  onSort,
  onDismiss
}) => {
  const sortedList = SORTS[sortKey](list);
  const reverseSortedList = isSortReverse
    ? sortedList.reverse()
    : sortedList;

  return(
    <Table>
      <Thead>
        <Tr>
        <Td>
          <Sort
            sortKey={'TITLE'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Title
          </Sort>
        </Td>
        <Td>
          <Sort
            sortKey={'AUTHOR'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Author
          </Sort>
        </Td>
        <Td>
          <Sort
            sortKey={'COMMENTS'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Comments
          </Sort>
        </Td>
        <Td>
          <Sort
            sortKey={'POINTS'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Points
          </Sort>
        </Td>
        <Td>
          Remove
                  </Td>
                  </Tr>
      
      </Thead>
      <Tbody>
      {reverseSortedList.map(item =>
        <div key={item.objectID}>
          <Td>
            <a href={item.url}>{item.title}</a>
          </Td>
          <Td>
            {item.author}
          </Td>
          <Td>
            {item.num_comments}
          </Td>
          <Td>
            {item.points}
          </Td>
          <Td>
            <Button
            style={{ fontSize: '1.5vw'}}
              onClick={() => onDismiss(item.objectID)}
              className="button-inline"
            >
              Dismiss
            </Button>
          </Td>
        </div>
      )}
      </Tbody>
    </Table>
  );
}

const Sort = ({
  sortKey,
  activeSortKey,
  onSort,
  children
}) => {
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
  );

  return (
    <Button
    style={{ fontSize: '1vw' }}
      onClick={() => onSort(sortKey)}
      className={sortClass}
    >
      {children}
    </Button>
  );
}



//from https://loading.io/css/
const Loading = () => <div className="lds-roller">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
</div>

const withLoading = (Component) => ({ isLoading, ...rest }) =>
  isLoading
    ? <Loading />
    : <Component { ...rest } />

const ButtonWithLoading = withLoading(Button);

export {
  Search,
  TableSorted,
};

export default App;
