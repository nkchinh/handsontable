describe('MergeCells', () => {
  let id = 'testContainer';

  beforeEach(function() {
    this.$container = $(`<div id="${id}"></div>`).appendTo('body');
  });

  afterEach(function() {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  describe('mergeCells option', () => {
    it('should merge cell in startup', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5),
        mergeCells: [
          {row: 0, col: 0, rowspan: 2, colspan: 2}
        ]
      });
      let TD = hot.rootElement.querySelector('td');

      expect(TD.getAttribute('rowspan')).toBe('2');
      expect(TD.getAttribute('colspan')).toBe('2');
    });
  });

  describe('mergeCells updateSettings', () => {
    it('should allow to overwrite the initial settings using the updateSettings method', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 10),
        mergeCells: [
          {row: 0, col: 0, rowspan: 2, colspan: 2}
        ]
      });
      let TD = hot.rootElement.querySelector('td');
      expect(TD.getAttribute('rowspan')).toBe('2');
      expect(TD.getAttribute('colspan')).toBe('2');

      updateSettings({
        mergeCells: [
          {row: 2, col: 2, rowspan: 2, colspan: 2}
        ]
      });

      TD = hot.rootElement.querySelector('td');
      expect(TD.getAttribute('rowspan')).toBe(null);
      expect(TD.getAttribute('colspan')).toBe(null);

      TD = getCell(2, 2);

      expect(TD.getAttribute('rowspan')).toBe('2');
      expect(TD.getAttribute('colspan')).toBe('2');
    });

    it('should allow resetting the merged cells by changing it to an empty array', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 10),
        mergeCells: [
          {row: 0, col: 0, rowspan: 2, colspan: 2}
        ]
      });
      let TD = hot.rootElement.querySelector('td');
      expect(TD.getAttribute('rowspan')).toBe('2');
      expect(TD.getAttribute('colspan')).toBe('2');

      updateSettings({
        mergeCells: []
      });

      TD = hot.rootElement.querySelector('td');
      expect(TD.getAttribute('rowspan')).toBe(null);
      expect(TD.getAttribute('colspan')).toBe(null);
    });

    it('should allow resetting and turning off the mergeCells plugin by changing mergeCells to \'false\'', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 10),
        mergeCells: [
          {row: 0, col: 0, rowspan: 2, colspan: 2}
        ]
      });
      let TD = hot.rootElement.querySelector('td');
      expect(TD.getAttribute('rowspan')).toBe('2');
      expect(TD.getAttribute('colspan')).toBe('2');

      updateSettings({
        mergeCells: false
      });

      TD = hot.rootElement.querySelector('td');
      expect(TD.getAttribute('rowspan')).toBe(null);
      expect(TD.getAttribute('colspan')).toBe(null);
    });

  });

  describe('mergeCells copy', () => {
    it('should not copy text of cells that are merged into another cell', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5),
        mergeCells: [
          {row: 0, col: 0, rowspan: 2, colspan: 2}
        ]
      });
      expect(hot.getCopyableText(0, 0, 2, 2)).toBe('A1\t\tC1\n\t\tC2\nA3\tB3\tC3');
    });
  });

  describe('merged cells selection', () => {

    it('should select the whole range of cells which form a merged cell', function() {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(4, 4),
        mergeCells: [
          {
            row: 0,
            col: 0,
            colspan: 4,
            rowspan: 1
          }
        ]
      });

      let $table = this.$container.find('table.htCore');
      let $td = $table.find('tr:eq(0) td:eq(0)');

      expect($td.attr('rowspan')).toEqual('1');
      expect($td.attr('colspan')).toEqual('4');

      expect(hot.getSelectedLast()).toBeUndefined();

      hot.selectCell(0, 0);

      expect(hot.getSelectedLast()).toEqual([0, 0, 0, 3]);

      deselectCell();

      hot.selectCell(0, 1);

      expect(hot.getSelectedLast()).toEqual([0, 0, 0, 3]);
    });

    it('should always make a rectangular selection, when selecting merged and not merged cells', function() {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(4, 4),
        mergeCells: [
          {
            row: 1,
            col: 1,
            colspan: 3,
            rowspan: 2
          }
        ]
      });

      let $table = this.$container.find('table.htCore');
      let $td = $table.find('tr:eq(1) td:eq(1)');

      expect($td.attr('rowspan')).toEqual('2');
      expect($td.attr('colspan')).toEqual('3');

      expect(hot.getSelectedLast()).toBeUndefined();

      hot.selectCell(0, 0);

      expect(hot.getSelectedLast()).toEqual([0, 0, 0, 0]);

      deselectCell();

      hot.selectCell(0, 0, 1, 1);

      expect(hot.getSelectedLast()).not.toEqual([0, 0, 1, 1]);
      expect(hot.getSelectedLast()).toEqual([0, 0, 2, 3]);

      deselectCell();

      hot.selectCell(0, 1, 1, 1);

      expect(hot.getSelectedLast()).toEqual([0, 1, 2, 3]);
    });

    it('should not switch the selection start point when selecting from non-merged cells to merged cells', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 10),
        mergeCells: [
          {row: 1, col: 1, rowspan: 3, colspan: 3},
          {row: 3, col: 4, rowspan: 2, colspan: 2}
        ]
      });

      $(hot.getCell(6, 6)).simulate('mousedown');

      expect(hot.getSelectedRangeLast().from.col).toEqual(6);
      expect(hot.getSelectedRangeLast().from.row).toEqual(6);

      $(hot.getCell(1, 1)).simulate('mouseenter');

      expect(hot.getSelectedRangeLast().from.col).toEqual(6);
      expect(hot.getSelectedRangeLast().from.row).toEqual(6);

      $(hot.getCell(3, 3)).simulate('mouseenter');

      expect(hot.getSelectedRangeLast().from.col).toEqual(6);
      expect(hot.getSelectedRangeLast().from.row).toEqual(6);

      $(hot.getCell(4, 4)).simulate('mouseenter');

      expect(hot.getSelectedRangeLast().from.col).toEqual(6);
      expect(hot.getSelectedRangeLast().from.row).toEqual(6);

    });

    it('should select cells in the correct direction when changing selections around a merged range', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 10),
        mergeCells: [
          {row: 4, col: 4, rowspan: 2, colspan: 2}
        ]
      });

      hot.selectCell(5, 5, 5, 2);
      expect(hot.getSelectedRangeLast().getDirection()).toEqual('SE-NW');

      hot.selectCell(4, 4, 2, 5);
      expect(hot.getSelectedRangeLast().getDirection()).toEqual('SW-NE');

      hot.selectCell(4, 4, 5, 7);
      expect(hot.getSelectedRangeLast().getDirection()).toEqual('NW-SE');

      hot.selectCell(4, 5, 7, 5);
      expect(hot.getSelectedRangeLast().getDirection()).toEqual('NE-SW');
    });

    it('should not add an area class to the selected cell if a single merged cell is selected', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(6, 6),
        mergeCells: [
          {
            row: 1,
            col: 1,
            colspan: 3,
            rowspan: 2
          }
        ]
      });

      selectCell(1, 1);
      expect(getCell(1, 1).className.indexOf('area')).toEqual(-1);

      selectCell(1, 1, 4, 4);
      expect(getCell(1, 1).className.indexOf('area')).not.toEqual(-1);

      selectCell(1, 1);
      expect(getCell(1, 1).className.indexOf('area')).toEqual(-1);

      selectCell(0, 0);
      expect(getCell(1, 1).className.indexOf('area')).toEqual(-1);
    });
  });

  describe('merged cells scroll', () => {
    it('getCell should return merged cell parent', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5),
        mergeCells: [
          {row: 0, col: 0, rowspan: 2, colspan: 2}
        ],
        height: 100,
        width: 400
      });

      let mergedCellParent = hot.getCell(0, 0);
      let mergedCellHidden = hot.getCell(1, 1);

      expect(mergedCellHidden).toBe(mergedCellParent);
    });

    it('should scroll viewport to beginning of a merged cell when it\'s clicked', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5),
        mergeCells: [
          {row: 5, col: 0, rowspan: 2, colspan: 2}
        ],
        height: 100,
        width: 400
      });

      let mainHolder = hot.view.wt.wtTable.holder;

      mainHolder.scrollTop = 130;
      hot.render();

      expect(mainHolder.scrollTop).toBe(130);

      let TD = hot.getCell(5, 0);
      mouseDown(TD);
      mouseUp(TD);
      let mergedCellScrollTop = mainHolder.scrollTop;
      expect(mergedCellScrollTop).toBeLessThan(130);
      expect(mergedCellScrollTop).toBeGreaterThan(0);

      mainHolder.scrollTop = 0;
      hot.render();

      mainHolder.scrollTop = 130;
      hot.render();

      TD = hot.getCell(5, 2);
      mouseDown(TD);
      mouseUp(TD);
      let regularCellScrollTop = mainHolder.scrollTop;
      expect(mergedCellScrollTop).toBe(regularCellScrollTop);
    });

    it('should render whole merged cell even when most rows are not in the viewport - scrolled to top', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(40, 5),
        mergeCells: [
          {row: 1, col: 0, rowspan: 21, colspan: 2},
          {row: 21, col: 2, rowspan: 18, colspan: 2}
        ],
        height: 100,
        width: 400
      });

      expect(hot.countRenderedRows()).toBe(39);
    });

    it('should render whole merged cell even when most rows are not in the viewport - scrolled to bottom', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(40, 5),
        mergeCells: [
          {row: 1, col: 0, rowspan: 21, colspan: 2},
          {row: 21, col: 2, rowspan: 18, colspan: 2}
        ],
        height: 100,
        width: 400
      });

      let mainHolder = hot.view.wt.wtTable.holder;

      $(mainHolder).scrollTop(99999);
      hot.render();

      expect(hot.countRenderedRows()).toBe(39);
    });

    it('should render whole merged cell even when most columns are not in the viewport - scrolled to the left', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(5, 40),
        mergeCells: [
          {row: 0, col: 1, rowspan: 2, colspan: 21},
          {row: 2, col: 21, rowspan: 2, colspan: 18}
        ],
        height: 100,
        width: 400
      });

      expect(hot.countRenderedCols()).toBe(39);
    });

    it('should render whole merged cell even when most columns are not in the viewport - scrolled to the right', function() {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(5, 40),
        mergeCells: [
          {row: 0, col: 1, rowspan: 2, colspan: 21},
          {row: 2, col: 21, rowspan: 2, colspan: 18}
        ],
        height: 100,
        width: 400
      });

      this.$container.scrollLeft(99999);
      hot.render();

      expect(hot.countRenderedCols()).toBe(39);
    });

  });

  describe('merge cells shift', () => {
    it('should shift the merged cells right, when inserting a column on the left side of them', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          {row: 1, col: 1, rowspan: 2, colspan: 2},
          {row: 2, col: 5, rowspan: 2, colspan: 2}
        ],
        height: 400,
        width: 400
      });

      hot.alter('insert_col', 3, 2);

      let plugin = hot.getPlugin('mergeCells');
      let mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].col).toEqual(1);
      expect(mergedCellsCollection[1].col).toEqual(7);
    });

    it('should shift the merged cells left, when removing a column on the left side of them', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          {row: 1, col: 1, rowspan: 2, colspan: 2},
          {row: 2, col: 5, rowspan: 2, colspan: 2}
        ],
        height: 400,
        width: 400
      });

      hot.alter('remove_col', 3, 2);

      let plugin = hot.getPlugin('mergeCells');
      let mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].col).toEqual(1);
      expect(mergedCellsCollection[1].col).toEqual(3);

    });

    it('should shift the merged cells down, when inserting rows above them', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          {row: 1, col: 1, rowspan: 2, colspan: 2},
          {row: 5, col: 5, rowspan: 2, colspan: 2}
        ],
        height: 400,
        width: 400
      });

      hot.alter('insert_row', 3, 2);

      let plugin = hot.getPlugin('mergeCells');
      let mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].row).toEqual(1);
      expect(mergedCellsCollection[1].row).toEqual(7);
    });

    it('should shift the merged cells up, when removing rows above them', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          {row: 1, col: 1, rowspan: 2, colspan: 2},
          {row: 5, col: 5, rowspan: 2, colspan: 2}
        ],
        height: 400,
        width: 400
      });

      hot.alter('remove_row', 3, 2);

      let plugin = hot.getPlugin('mergeCells');
      let mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].row).toEqual(1);
      expect(mergedCellsCollection[1].row).toEqual(3);
    });
  });

  xdescribe('canMergeRange', () => {
    it('should return false if start and end cell is the same', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5)
      });
      let mergeCells = new Handsontable.plugins.MergeCells(hot);
      let result = mergeCells.canMergeRange({
        from: {
          row: 0, col: 1
        },
        to: {
          row: 0, col: 1
        }
      });

      expect(result).toBe(false);
    });

    it('should return true for 2 consecutive cells in the same column', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5)
      });
      let mergeCells = new Handsontable.plugins.MergeCells(hot);
      let result = mergeCells.canMergeRange({
        from: {
          row: 0, col: 1
        },
        to: {
          row: 1, col: 1
        }
      });

      expect(result).toBe(true);
    });

    it('should return true for 2 consecutive cells in the same row', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5)
      });
      let mergeCells = hot.getPlugin('mergeCells');
      let result = mergeCells.canMergeRange({
        from: {
          row: 0, col: 1
        },
        to: {
          row: 0, col: 2
        }
      });

      expect(result).toBe(true);
    });

    it('should return true for 4 neighboring cells', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5)
      });
      let mergeCells = hot.getPlugin('mergeCells');
      let result = mergeCells.canMergeRange({
        from: {
          row: 0, col: 1
        },
        to: {
          row: 1, col: 2
        }
      });

      expect(result).toBe(true);
    });
  });

  xdescribe('modifyTransform', () => {
    it('should not transform arrow right when entering a merged cell', () => {
      let mergeCellsSettings = [
        {row: 1, col: 1, rowspan: 3, colspan: 3}
      ];
      let coords = new CellCoords(1, 0);
      let currentSelection = new CellRange(coords, coords, coords);
      let mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      let inDelta = new CellCoords(0, 1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(0, 1));
    });

    it('should transform arrow right when leaving a merged cell', () => {
      let mergeCellsSettings = [
        {row: 1, col: 1, rowspan: 3, colspan: 3}
      ];
      let coords = new CellCoords(1, 1);
      let currentSelection = new CellRange(coords, coords, coords);
      let mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      let inDelta = new CellCoords(0, 1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(0, 3));
    });

    it('should transform arrow right when leaving a merged cell (return to desired row)', () => {
      let mergeCellsSettings = [
        {row: 1, col: 1, rowspan: 3, colspan: 3}
      ];
      let mergeCells = new Handsontable.MergeCells(mergeCellsSettings);

      let coords = new CellCoords(2, 0);
      let currentSelection = new CellRange(coords, coords, coords);
      let inDelta = new CellCoords(0, 1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(-1, 1));

      coords = new CellCoords(1, 1);
      currentSelection = new CellRange(coords, coords, coords);
      inDelta = new CellCoords(0, 1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(1, 3));
    });

    it('should transform arrow left when entering a merged cell', () => {
      let mergeCellsSettings = [
        {row: 1, col: 1, rowspan: 3, colspan: 3}
      ];
      let coords = new CellCoords(1, 4);
      let currentSelection = new CellRange(coords, coords, coords);
      let mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      let inDelta = new CellCoords(0, -1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(0, -3));
    });

    it('should not transform arrow left when leaving a merged cell', () => {
      let mergeCellsSettings = [
        {row: 1, col: 1, rowspan: 3, colspan: 3}
      ];
      let coords = new CellCoords(1, 1);
      let currentSelection = new CellRange(coords, coords, coords);
      let mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      let inDelta = new CellCoords(0, -1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(0, -1));
    });

    it('should transform arrow left when leaving a merged cell (return to desired row)', () => {
      let mergeCellsSettings = [
        {row: 1, col: 1, rowspan: 3, colspan: 3}
      ];
      let mergeCells = new Handsontable.MergeCells(mergeCellsSettings);

      let coords = new CellCoords(2, 4);
      let currentSelection = new CellRange(coords, coords, coords);
      let inDelta = new CellCoords(0, -1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(-1, -3));

      coords = new CellCoords(1, 1);
      currentSelection = new CellRange(coords, coords, coords);
      inDelta = new CellCoords(0, -1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(1, -1));
    });

    it('should not transform arrow down when entering a merged cell', () => {
      let mergeCellsSettings = [
        {row: 1, col: 1, rowspan: 3, colspan: 3}
      ];
      let coords = new CellCoords(0, 1);
      let currentSelection = new CellRange(coords, coords, coords);
      let mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      let inDelta = new CellCoords(0, -1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(0, -1));
    });

    it('should transform arrow down when leaving a merged cell', () => {
      let mergeCellsSettings = [
        {row: 1, col: 1, rowspan: 3, colspan: 3}
      ];
      let coords = new CellCoords(1, 1);
      let currentSelection = new CellRange(coords, coords, coords);
      let mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      let inDelta = new CellCoords(1, 0);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(3, 0));
    });

    it('should transform arrow up when entering a merged cell', () => {
      let mergeCellsSettings = [
        {row: 1, col: 1, rowspan: 3, colspan: 3}
      ];
      let coords = new CellCoords(4, 1);
      let currentSelection = new CellRange(coords, coords, coords);
      let mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      let inDelta = new CellCoords(-1, 0);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(-3, 0));
    });

    it('should not transform arrow up when leaving a merged cell', () => {
      let mergeCellsSettings = [
        {row: 1, col: 1, rowspan: 3, colspan: 3}
      ];
      let coords = new CellCoords(1, 1);
      let currentSelection = new CellRange(coords, coords, coords);
      let mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      let inDelta = new CellCoords(-1, 0);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(-1, 0));
    });
  });

  describe('ContextMenu', () => {
    it('should disable `Merge cells` context menu item when context menu was triggered from corner header', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5),
        rowHeaders: true,
        colHeaders: true,
        contextMenu: true,
        mergeCells: true,
      });

      $('.ht_clone_top_left_corner .htCore')
        .find('thead')
        .find('th')
        .eq(0)
        .simulate('mousedown', {which: 3});
      contextMenu();

      expect($('.htContextMenu tbody td.htDisabled').text()).toBe([
        'Insert column left',
        'Insert column right',
        'Remove row',
        'Remove column',
        'Undo',
        'Redo',
        'Read only',
        'Alignment',
        'Merge cells',
      ].join(''));
    });
  });

  describe('Validation', () => {
    it('should not hide the merged cells after validating the table', (done) => {
      let onAfterValidate = jasmine.createSpy('onAfterValidate');
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          {row: 5, col: 4, rowspan: 2, colspan: 2},
          {row: 1, col: 1, rowspan: 2, colspan: 2},
        ],
        validator: function(query, callback) {
          callback(true);
        },
        afterValidate: onAfterValidate
      });

      let firstCollection = hot.getCell(5, 4);
      let secondCollection = hot.getCell(1, 1);

      expect(firstCollection.style.display.indexOf('none')).toEqual(-1);
      expect(secondCollection.style.display.indexOf('none')).toEqual(-1);

      hot.validateCells();

      setTimeout(() => {
        expect(onAfterValidate).toHaveBeenCalled();

        firstCollection = hot.getCell(5, 4);
        secondCollection = hot.getCell(1, 1);

        expect(firstCollection.style.display.indexOf('none')).toEqual(-1);
        expect(secondCollection.style.display.indexOf('none')).toEqual(-1);

        done();
      }, 100);
    });
  });

  describe('Entire row/column selection', () => {
    it('should be possible to select a single entire column, when there\'s a merged cell in it', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          {row: 5, col: 4, rowspan: 2, colspan: 5}
        ]
      });

      hot.selectCell(0, 5, 9, 5);
      expect(JSON.stringify(hot.getSelectedLast())).toEqual('[0,5,9,5]');

      // it should work only for selecting the entire column
      hot.selectCell(4, 5, 7, 5);
      expect(JSON.stringify(hot.getSelectedLast())).toEqual('[4,4,7,8]');
    });

    it('should be possible to select a single entire row, when there\'s a merged cell in it', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          {row: 5, col: 4, rowspan: 5, colspan: 2}
        ]
      });

      hot.selectCell(5, 0, 5, 9);
      expect(JSON.stringify(hot.getSelectedLast())).toEqual('[5,0,5,9]');

      // it should work only for selecting the entire row
      hot.selectCell(6, 3, 6, 7);
      expect(JSON.stringify(hot.getSelectedLast())).toEqual('[5,3,9,7]');
    });
  });

  describe('Undo/Redo', () => {
    it('should not be possible to remove initially declared merged cells by calling the \'Undo\' action.', () => {
      let hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          {row: 5, col: 4, rowspan: 2, colspan: 5},
          {row: 1, col: 1, rowspan: 2, colspan: 2},
        ]
      });

      hot.undo();

      expect(hot.getPlugin('mergeCells').mergedCellsCollection.mergedCells.length).toEqual(2);
    });

    it('should be possible undo the merging process by calling the \'Undo\' action.', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: true
      });

      const plugin = hot.getPlugin('mergeCells');
      plugin.merge(0, 0, 3, 3);
      hot.selectCell(4, 4, 7, 7);
      plugin.mergeSelection();

      expect(plugin.mergedCellsCollection.mergedCells.length).toEqual(2);
      hot.undo();
      expect(plugin.mergedCellsCollection.mergedCells.length).toEqual(1);
      hot.undo();
      expect(plugin.mergedCellsCollection.mergedCells.length).toEqual(0);
    });

    it('should be possible redo the merging process by calling the \'Redo\' action.', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: true
      });

      const plugin = hot.getPlugin('mergeCells');
      plugin.merge(0, 0, 3, 3);
      hot.selectCell(4, 4, 7, 7);
      plugin.mergeSelection();

      hot.undo();
      hot.undo();

      hot.redo();
      expect(plugin.mergedCellsCollection.mergedCells.length).toEqual(1);
      hot.redo();
      expect(plugin.mergedCellsCollection.mergedCells.length).toEqual(2);
    });
  });
});
