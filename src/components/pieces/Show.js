import React from 'react';
import Auth from '../../lib/Auth';
import axios from 'axios';

import DiariesShow from '../diaries/Show';
import DiariesCreate from '../diaries/Create';

import PieceLine from '../graphs/PieceLine';

class PiecesShow extends React.Component {
  state = {
    editMode: false,
    editedPiece: {},
    piece: {}
  }

  componentDidMount = () => {
    axios
      .get(`/api/users/${Auth.getPayload().sub}/pieces/${this.props.piece}`,
        { headers: { Authorization: `Bearer ${Auth.getToken()}` }})
      .then(res => this.setState({ piece: res.data, editedPiece: res.data }));
  }

  componentDidUpdate = () => {
    if (this.props.piece !== this.state.piece._id) {
      axios
        .get(`/api/users/${Auth.getPayload().sub}/pieces/${this.props.piece}`,
          { headers: { Authorization: `Bearer ${Auth.getToken()}` }})
        .then(res => this.setState({ piece: res.data, editedPiece: res.data }));
    }
  }

  handleChange = ({ target: { name, value } }) => {
    this.setState({ editedPiece: { ...this.state.editedPiece, [name]: value }});
  }

  findSelectedInstrument = formInstrument => this.state.piece.instrument === formInstrument;

  handleSubmit = e => {
    e.preventDefault();
    axios
      .put(`/api/users/${Auth.getPayload().sub}/pieces/${this.props.piece}`, this.state.editedPiece, {
        headers: { Authorization: `Bearer ${Auth.getToken()}`}
      })
      .then(res => {
        const piece = res.data;
        this.setState({ piece });
      })
      .then(() => {
        this.setState({ editMode: false });
        this.componentDidMount();
      });
  }

  handleDelete = () => {
    axios
      .delete(`/api/users/${Auth.getPayload().sub}/pieces/${this.props.piece}`, {
        headers: { Authorization: `Bearer ${Auth.getToken()}` }
      })
      .then(() => {
        this.props.handlePieceShowClose();
      });
  }

  toggleEdit = () => {
    this.setState({ editMode: !this.state.editMode });
  }

  render() {
    return (
      <div>
        { !this.state.editMode &&
          <div>
            <h1>Title: {this.state.piece.title}</h1>
            <h2>Composer: {this.state.piece.composer}</h2>
            <h2>Description: {this.state.piece.description}</h2>
            <h3>Instrument: {this.state.piece.instrument}</h3>
            <h2>{this.state.piece.totalPracticed} minutes practiced</h2>
            { this.state.piece.title && <PieceLine
              piece={this.state.piece}
            /> }
            <button onClick={this.toggleEdit}>Open edit</button>
            <DiariesCreate
              pieceId={this.state.piece._id}
              componentDidMount={this.componentDidMount}
            />
            { this.state.piece.diary && this.state.piece.diary.map(entry => {
              return (
                <DiariesShow
                  key={entry._id}
                  pieceId={this.state.piece._id}
                  componentDidMount={this.componentDidMount}
                  data={entry}
                />
              );
            })
            }
          </div>
        }
        { this.state.editMode &&
          <div>
            <input name="title" value={this.state.editedPiece.title} onChange={this.handleChange} />
            <input name="composer" value={this.state.editedPiece.composer} onChange={this.handleChange}></input>
            <input name="description" value={this.state.editedPiece.description} onChange={this.handleChange}></input>
            <select name="instrument" onChange={this.handleChange}>
              { this.props.user.instruments.map((instrument, i) => {
                return <option
                  selected={this.findSelectedInstrument(instrument.name)}
                  key={i}
                  value={instrument.name}>
                  {instrument.name}
                </option>;
              })}
            </select>
            <button onClick={this.handleSubmit}>Submit changes</button>
            <button onClick={this.handleDelete}>Delete the piece</button>
            <button onClick={this.toggleEdit}>Close edit without saving</button>
          </div>
        }
      </div>
    );
  }
}

export default PiecesShow;