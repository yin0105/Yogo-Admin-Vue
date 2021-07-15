export default (value, sortField, sortOrder, sortMethod) => {

  if (typeof sortMethod === 'function') {
    value.sort(sortMethod)
    if (sortOrder === 'desc') {
      _.reverse(value)
    }
    return value
  }

  function applySortOrder(compareResult) {
    return sortOrder === 'desc' ? compareResult * -1 : compareResult
  }

  return value.sort((a, b) => {

    switch (sortMethod) {
      case 'string':
        if (sortOrder === 'asc') {
          return a[sortField].toLowerCase().localeCompare(b[sortField].toLowerCase())
        }
        return b[sortField].toLowerCase().localeCompare(a[sortField].toLowerCase())
      case 'number':
        if (parseFloat(a[sortField]) < parseFloat(b[sortField])) return applySortOrder(-1)
        if (parseFloat(a[sortField]) > parseFloat(b[sortField])) return applySortOrder(1)
        return 0
      case 'boolean':
        if (a[sortField] && !b[sortField]) return applySortOrder(-1)
        if (b[sortField] && !a[sortField]) return applySortOrder(1)
        return 0
      case 'array_element_name':
        if (!a[sortField] || !a[sortField].length) return applySortOrder(-1)
        if (!b[sortField] || !b[sortField].length) return applySortOrder(1)
        let idx = 0
        while (a[sortField][idx] && b[sortField][idx] && a[sortField][idx].name === b[sortField][idx].name) {
          idx += 1
        }
        if (!a[sortField][idx]) return applySortOrder(-1)
        if (!b[sortField][idx]) return applySortOrder(1)
        return applySortOrder(
          a[sortField][idx].name.toLowerCase().localeCompare(
            b[sortField][0].name.toLowerCase(),
          ),
        )
      case 'object_name':
        if (!a[sortField]) return applySortOrder(-1)
        if (!b[sortField]) return applySortOrder(1)
        return applySortOrder(
          a[sortField].name.toLowerCase().localeCompare(
            b[sortField].name.toLowerCase(),
          ),
        )
      default:
        throw new Error('Invalid sortMethod')
    }

  })

}

