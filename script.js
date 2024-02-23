document.addEventListener('DOMContentLoaded', () => {
    let studentData = []; 

    const populateTable = (students) => {
        const tbody = document.querySelector('#studentsTable tbody');
        tbody.innerHTML = ''; 
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" name="studentCheckbox" data-id="${student.id}"></td>
                <td>${student.name}</td>
                <td>${student.active}</td>
                <td>${student.yearsOld}</td>
                <td>${student.color}</td>
            `;
            tbody.appendChild(row);
        });
    };

    const populateDropdown = (attribute, dropdownId) => {
        const dropdown = document.querySelector(`#${dropdownId}`);
        const distinctValues = [...new Set(studentData.map(student => student[attribute]))]; 
        dropdown.innerHTML = `<option selected>All</option>`;
        distinctValues.forEach(value => {
            const option = document.createElement('option');
            option.textContent = value;
            option.value = value;
            dropdown.appendChild(option);
        });
    };

    const filterByAttribute = (attribute, value) => {
        if (value === 'All') {
            populateTable(studentData); 
        } else {
            const filteredStudents = studentData.filter(student => {
                return Object.values(student).some(val => val.toString().toLowerCase().includes(value.toLowerCase()));
            });
            populateTable(filteredStudents); 
        }
    };

    const getStudent = () => {
        fetch('students.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(json => {
                studentData = json.students; 
                populateTable(studentData);
                populateDropdown('yearsOld', 'ageFilter');
                populateDropdown('color', 'colorFilter');
            })
            .catch(error => console.error('Error fetching students:', error));
    };

    getStudent();

    document.querySelector('#ageFilter').addEventListener('change', (event) => {
        const selectedAge = event.target.value;
        filterByAttribute('yearsOld', selectedAge);
    });

    document.querySelector('#colorFilter').addEventListener('change', (event) => {
        const selectedColor = event.target.value;
        filterByAttribute('color', selectedColor);
    });

    document.querySelector('#searchInput').addEventListener('input', (event) => {
        const searchTerm = event.target.value.trim();
        filterByAttribute('name', searchTerm);
    });

    document.querySelector('#allOrdersCheckbox').addEventListener('change', (event) => {
        const checkboxes = document.querySelectorAll('[name="studentCheckbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = event.target.checked;
        });

        const headerCheckbox = document.querySelector('#headerCheckbox');
        if (headerCheckbox) {
            headerCheckbox.checked = event.target.checked;
        }
    });

    document.querySelectorAll('[name="studentCheckbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const allOrdersCheckbox = document.querySelector('#allOrdersCheckbox');
            allOrdersCheckbox.checked = [...document.querySelectorAll('[name="studentCheckbox"]:checked')].length === checkboxes.length;
        });
    });

    document.querySelector('#exportButton').addEventListener('click', () => {
        const selectedRows = [...document.querySelectorAll('[name="studentCheckbox"]:checked')];
        const exportData = selectedRows.map(row => {
            const studentId = row.getAttribute('data-id');
            const student = studentData.find(s => s.id === parseInt(studentId));
            return {
                NAME: student.name,
                ACTIVE: student.active,
                YEARS: student.yearsOld,
                COLOR: student.color
            };
        });

        exportData.unshift({
            NAME: 'Name',
            ACTIVE: 'Active',
            YEARS: 'Age',
            COLOR: 'Color'
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + exportData.map(row => Object.values(row).join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'exported_data.csv');
        document.body.appendChild(link);
        link.click();
    });
});
