/* Authored layouts with search-verified shortest paths. */
window.ShiftLevels = [
  {
    "title": "First contact",
    "note": "Every signal has a home. Shift the bottom row right to find the first one.",
    "size": 3,
    "goal": [
      0,
      4,
      8
    ],
    "start": [
      0,
      4,
      7
    ],
    "par": 1,
    "solution": [
      {
        "axis": "row",
        "line": 2,
        "direction": 1
      }
    ]
  },
  {
    "title": "Around the edge",
    "note": "The edge is a doorway: signals wrap around to the other side.",
    "size": 3,
    "goal": [
      0,
      4,
      8
    ],
    "start": [
      1,
      5,
      8
    ],
    "par": 2,
    "solution": [
      {
        "axis": "row",
        "line": 1,
        "direction": -1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": -1
      }
    ]
  },
  {
    "title": "Shared frequency",
    "note": "One shift can move more than one signal. Think about the whole line.",
    "size": 3,
    "goal": [
      0,
      4,
      8
    ],
    "start": [
      2,
      5,
      7
    ],
    "par": 3,
    "solution": [
      {
        "axis": "row",
        "line": 2,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 1,
        "direction": -1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      }
    ]
  },
  {
    "title": "Crossed wires",
    "note": "A little more space. Select any cell, then use the arrow keys.",
    "size": 4,
    "goal": [
      0,
      3,
      12,
      15
    ],
    "start": [
      4,
      0,
      13,
      11
    ],
    "par": 3,
    "solution": [
      {
        "axis": "col",
        "line": 0,
        "direction": -1
      },
      {
        "axis": "row",
        "line": 3,
        "direction": -1
      },
      {
        "axis": "col",
        "line": 3,
        "direction": 1
      }
    ]
  },
  {
    "title": "Countercurrent",
    "note": "Sometimes a signal has to leave home before everyone can arrive.",
    "size": 4,
    "goal": [
      0,
      3,
      12,
      15
    ],
    "start": [
      15,
      2,
      7,
      11
    ],
    "par": 4,
    "solution": [
      {
        "axis": "col",
        "line": 3,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 2,
        "direction": 1
      },
      {
        "axis": "col",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      }
    ]
  },
  {
    "title": "The long way home",
    "note": "A row and a column do not always undo each other. Order matters.",
    "size": 4,
    "goal": [
      0,
      3,
      12,
      15
    ],
    "start": [
      2,
      5,
      13,
      8
    ],
    "par": 5,
    "solution": [
      {
        "axis": "col",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 3,
        "direction": -1
      },
      {
        "axis": "col",
        "line": 1,
        "direction": -1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      }
    ]
  },
  {
    "title": "Interference",
    "note": "Look for a line that can carry two signals closer at once.",
    "size": 4,
    "goal": [
      0,
      3,
      12,
      15
    ],
    "start": [
      6,
      12,
      8,
      2
    ],
    "par": 6,
    "solution": [
      {
        "axis": "col",
        "line": 2,
        "direction": -1
      },
      {
        "axis": "row",
        "line": 3,
        "direction": 1
      },
      {
        "axis": "col",
        "line": 1,
        "direction": 1
      },
      {
        "axis": "col",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      }
    ]
  },
  {
    "title": "Wider horizons",
    "note": "A wider field. Use the empty cells to make room for a better route.",
    "size": 5,
    "goal": [
      0,
      4,
      20,
      24
    ],
    "start": [
      4,
      8,
      10,
      20
    ],
    "par": 5,
    "solution": [
      {
        "axis": "row",
        "line": 4,
        "direction": -1
      },
      {
        "axis": "col",
        "line": 3,
        "direction": -1
      },
      {
        "axis": "col",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "col",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      }
    ]
  },
  {
    "title": "Close encounters",
    "note": "Four signals, one shared space. Find their rhythm.",
    "size": 5,
    "goal": [
      0,
      4,
      20,
      24
    ],
    "start": [
      8,
      22,
      15,
      4
    ],
    "par": 6,
    "solution": [
      {
        "axis": "col",
        "line": 4,
        "direction": -1
      },
      {
        "axis": "col",
        "line": 3,
        "direction": -1
      },
      {
        "axis": "col",
        "line": 2,
        "direction": 1
      },
      {
        "axis": "col",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      }
    ]
  },
  {
    "title": "Perfect alignment",
    "note": "Bring every frequency into alignment. There is no time limit.",
    "size": 5,
    "goal": [
      0,
      4,
      20,
      24
    ],
    "start": [
      8,
      21,
      10,
      3
    ],
    "par": 7,
    "solution": [
      {
        "axis": "col",
        "line": 3,
        "direction": -1
      },
      {
        "axis": "row",
        "line": 4,
        "direction": 1
      },
      {
        "axis": "col",
        "line": 2,
        "direction": 1
      },
      {
        "axis": "col",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "col",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      },
      {
        "axis": "row",
        "line": 0,
        "direction": 1
      }
    ]
  }
];
