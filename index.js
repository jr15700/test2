document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('itemModal');
    const openModal = document.getElementById('openModal');
    const openModalEmpty = document.getElementById('openModalEmpty');
    const closeModal = document.getElementById('closeModal');
    const cancelModal = document.getElementById('cancelModal');
    const submitBtn = document.getElementById('submitBtn');
    const inventoryBody = document.getElementById('inventory-body');
    const emptyState = document.getElementById('empty-state');
    const searchBox = document.querySelector('.search-box input');
    const categoryDropdown = document.querySelector('.dropdown');
  
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  
    function renderInventory() {
      inventoryBody.innerHTML = '';
      let categories = new Set();
  
      if (inventory.length === 0) {
        emptyState.style.display = 'block';
        return;
      } else {
        emptyState.style.display = 'none';
      }
  
      inventory.forEach((item, index) => {
        const row = document.createElement('tr');
  
        // Separate quantity and unit into different cells
        row.innerHTML = `
          <td>${item.stockNumber}</td>
          <td>${item.itemName}</td>
          <td>${item.category}</td>
          <td class="quantity-value">${item.quantity}</td>
          <td class="quantity-unit">${item.unit}</td>
          <td>${item.location}</td>
          <td class="actions-cell">
            <button class="btn-edit" onclick="editItem(${index})">Edit</button>
            <button class="btn-delete" onclick="deleteItem(${index})">Delete</button>
          </td>
        `;
  
        inventoryBody.appendChild(row);
        categories.add(item.category);
      });
  
      // Populate dropdown
      categoryDropdown.innerHTML = '<option>All Categories</option>';
      [...categories].sort().forEach(cat => {
        categoryDropdown.innerHTML += `<option value="${cat}">${cat}</option>`;
      });
    }
  
    function resetForm() {
      document.getElementById('stockNumber').value = '';
      document.getElementById('itemName').value = '';
      document.getElementById('description').value = '';
      document.getElementById('category').value = '';
      document.getElementById('location').value = '';
      document.getElementById('unit').value = '';
      document.getElementById('quantity').value = 0;
      
      // Reset form validation styles if any
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.classList.remove('error');
      });
    }
  
    function validateForm() {
      let isValid = true;
      const requiredFields = ['stockNumber', 'itemName', 'category', 'location', 'unit', 'quantity'];
      
      // Reset previous validation
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.classList.remove('error');
      });
      
      for (let id of requiredFields) {
        const input = document.getElementById(id);
        if (!input.value.trim()) {
          input.classList.add('error');
          isValid = false;
        }
      }
      
      if (!isValid) {
        alert('Please fill out all required fields');
      }
      
      return isValid;
    }
  
    function addItem() {
      if (!validateForm()) return;
  
      const item = {
        stockNumber: document.getElementById('stockNumber').value.trim(),
        itemName: document.getElementById('itemName').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value.trim(),
        location: document.getElementById('location').value.trim(),
        unit: document.getElementById('unit').value.trim(),
        quantity: parseInt(document.getElementById('quantity').value)
      };
  
      inventory.push(item);
      localStorage.setItem('inventory', JSON.stringify(inventory));
      renderInventory();
      modal.style.display = 'none';
      resetForm();
      
      // Show success notification
      showNotification('Item added successfully!', 'success');
    }
  
    window.deleteItem = function(index) {
      if (confirm('Are you sure you want to delete this item?')) {
        inventory.splice(index, 1);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        renderInventory();
        showNotification('Item deleted!', 'info');
      }
    }
  
    window.editItem = function(index) {
      const item = inventory[index];
      document.getElementById('stockNumber').value = item.stockNumber;
      document.getElementById('itemName').value = item.itemName;
      document.getElementById('description').value = item.description || '';
      document.getElementById('category').value = item.category;
      document.getElementById('location').value = item.location;
      document.getElementById('unit').value = item.unit;
      document.getElementById('quantity').value = item.quantity;
  
      // Change modal title to Edit
      document.querySelector('.modal-header h2').textContent = 'Edit Item';
      document.getElementById('submitBtn').textContent = 'Update Item';
  
      modal.style.display = 'block';
  
      submitBtn.onclick = () => {
        if (!validateForm()) return;
        inventory[index] = {
          stockNumber: document.getElementById('stockNumber').value.trim(),
          itemName: document.getElementById('itemName').value.trim(),
          description: document.getElementById('description').value.trim(),
          category: document.getElementById('category').value.trim(),
          location: document.getElementById('location').value.trim(),
          unit: document.getElementById('unit').value.trim(),
          quantity: parseInt(document.getElementById('quantity').value)
        };
        localStorage.setItem('inventory', JSON.stringify(inventory));
        renderInventory();
        modal.style.display = 'none';
        resetForm();
        
        // Reset modal title and button
        document.querySelector('.modal-header h2').textContent = 'Add New Item';
        document.getElementById('submitBtn').textContent = 'Add Item';
        
        // Update button handler
        submitBtn.onclick = addItem;
        
        // Show success notification
        showNotification('Item updated successfully!', 'success');
      };
    }
  
    function searchInventory(query) {
      const rows = inventoryBody.querySelectorAll('tr');
      let foundResults = false;
      
      rows.forEach(row => {
        const match = [...row.children].some(td =>
          td.textContent.toLowerCase().includes(query.toLowerCase())
        );
        row.style.display = match ? '' : 'none';
        if (match) foundResults = true;
      });
      
      // Show/hide empty state based on search results
      emptyState.style.display = foundResults || query === '' ? 'none' : 'block';
      if (!foundResults && query !== '') {
        emptyState.innerHTML = `<p>No results found for "${query}"</p>`;
      } else if (inventory.length === 0) {
        emptyState.innerHTML = '<p>No inventory items found. Add your first item to get started.</p>' +
          '<button class="btn-add" id="openModalEmpty">Add Item</button>';
        document.getElementById('openModalEmpty').onclick = () => {
          modal.style.display = 'block';
          resetForm();
          submitBtn.onclick = addItem;
        };
      }
    }
    
    function showNotification(message, type = 'info') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      
      // Style the notification
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.padding = '12px 20px';
      notification.style.borderRadius = '4px';
      notification.style.fontWeight = '500';
      notification.style.zIndex = '1001';
      notification.style.animation = 'fadeIn 0.3s ease';
      
      // Set background color based on type
      if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
        notification.style.color = 'white';
      } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
        notification.style.color = 'white';
      } else {
        notification.style.backgroundColor = '#3b82f6';
        notification.style.color = 'white';
      }
      
      // Add to document
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(10px)';
        notification.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }
  
    // Event Listeners
    openModal.onclick = () => {
      modal.style.display = 'block';
      resetForm();
      // Reset modal title and button in case it was changed
      document.querySelector('.modal-header h2').textContent = 'Add New Item';
      document.getElementById('submitBtn').textContent = 'Add Item';
      submitBtn.onclick = addItem;
    };
    
    if (openModalEmpty) {
      openModalEmpty.onclick = () => {
        modal.style.display = 'block';
        resetForm();
        submitBtn.onclick = addItem;
      };
    }
    
    closeModal.onclick = () => (modal.style.display = 'none');
    cancelModal.onclick = () => (modal.style.display = 'none');
    
    // Close modal when clicking outside
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
    
    searchBox.oninput = e => searchInventory(e.target.value);
    
    categoryDropdown.onchange = function () {
      const selected = this.value;
      const rows = inventoryBody.querySelectorAll('tr');
      let foundResults = false;
      
      rows.forEach(row => {
        const category = row.children[2].textContent;
        const shouldDisplay = selected === 'All Categories' || category === selected;
        row.style.display = shouldDisplay ? '' : 'none';
        if (shouldDisplay) foundResults = true;
      });
      
      // Show/hide empty state based on filter results
      emptyState.style.display = foundResults ? 'none' : 'block';
      if (!foundResults) {
        emptyState.innerHTML = `<p>No items found in category "${selected}"</p>`;
      }
    };
  
    // Add CSS class for error highlighting
    const style = document.createElement('style');
    style.textContent = `
      input.error, textarea.error {
        border-color: var(--danger-color) !important;
        background-color: #fff5f5 !important;
      }
      
      .quantity-value {
        font-weight: 600;
        text-align: right;
      }
      
      .quantity-unit {
        color: var(--medium-text);
      }
    `;
    document.head.appendChild(style);
  
    // Initial render
    renderInventory();
  });