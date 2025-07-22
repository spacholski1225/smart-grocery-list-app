class GroceryListApp {
    constructor() {
        this.lists = [];
        this.currentListId = null;
        this.currentItemId = null;
        this.selectedListId = null;
        this.apiBaseUrl = `http://${window.location.hostname}:8000/api/v1`;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadLists();
        this.initDragAndDrop();
    }

    bindEvents() {
        document.getElementById('add-list-btn').addEventListener('click', () => this.showListModal());
        document.getElementById('close-modal').addEventListener('click', () => this.hideListModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.hideListModal());
        document.getElementById('list-form').addEventListener('submit', (e) => this.handleListSubmit(e));
        
        document.getElementById('close-item-modal').addEventListener('click', () => this.hideItemModal());
        document.getElementById('cancel-item-btn').addEventListener('click', () => this.hideItemModal());
        document.getElementById('item-form').addEventListener('submit', (e) => this.handleItemSubmit(e));
        document.getElementById('item-name').addEventListener('input', (e) => this.handleSuggestions(e));

        // Convert text modal events
        document.getElementById('convert-text-btn').addEventListener('click', () => this.showConvertTextModal());
        document.getElementById('close-convert-modal').addEventListener('click', () => this.hideConvertTextModal());
        document.getElementById('cancel-convert-btn').addEventListener('click', () => this.hideConvertTextModal());
        document.getElementById('convert-text-form').addEventListener('submit', (e) => this.handleConvertTextSubmit(e));
    }

    async loadLists() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/lists`);
            const summaries = await response.json();
            
            // Pobierz szczegóły każdej listy
            const listPromises = summaries.map(async (summary) => {
                try {
                    const detailResponse = await fetch(`${this.apiBaseUrl}/lists/${summary.id}`);
                    const list = await detailResponse.json();
                    if (list.items && list.items.length > 0) {
                        // Sortuj elementy według pozycji
                        list.items.sort((a, b) => (a.position || 0) - (b.position || 0));
                    }
                    return list;
                } catch (error) {
                    console.error(`Błąd podczas ładowania listy ${summary.id}:`, error);
                    return summary; // fallback to summary
                }
            });
            
            this.lists = await Promise.all(listPromises);
            this.renderTabs();
            this.renderActiveList();
        } catch (error) {
            console.error('Błąd podczas ładowania list:', error);
            this.showEmptyState();
        }
    }

    renderTabs() {
        const container = document.getElementById('tabs-nav');
        
        if (this.lists.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-center py-2">Brak list</p>';
            return;
        }

        container.innerHTML = this.lists.map(list => this.renderTabItem(list)).join('');
    }

    renderTabItem(list) {
        const isActive = this.selectedListId === list.id;
        const completedCount = list.items?.filter(item => item.is_checked).length || 0;
        const totalCount = list.items?.length || 0;
        const typeColor = list.list_type === 'zakupy' ? 'neon-pink' : 'neon-blue';

        return `
            <button onclick="app.selectList(${list.id})" 
                    class="flex-shrink-0 px-3 sm:px-4 py-3 rounded-lg sm:rounded-t-lg sm:rounded-b-none transition-all duration-200 border-b-2 mobile-touch-target ${isActive ? 
                        'bg-gradient-to-r from-' + typeColor + ' to-gray-700 text-white border-' + typeColor : 
                        'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border-transparent'
                    }">
                <div class="flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span class="font-medium text-sm whitespace-nowrap">${list.name}</span>
                    <span class="text-xs bg-${typeColor} bg-opacity-20 text-${typeColor} px-2 py-1 rounded-full">
                        ${completedCount}/${totalCount}
                    </span>
                </div>
            </button>
        `;
    }

    renderActiveList() {
        const container = document.getElementById('active-list-container');
        const emptyState = document.getElementById('empty-state');
        const welcomeState = document.getElementById('welcome-state');
        
        if (this.lists.length === 0) {
            container.innerHTML = '';
            welcomeState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        if (!this.selectedListId) {
            container.innerHTML = '';
            welcomeState.classList.remove('hidden');
            return;
        }

        welcomeState.classList.add('hidden');
        const selectedList = this.lists.find(list => list.id === this.selectedListId);
        if (selectedList) {
            container.innerHTML = this.renderActiveListCard(selectedList);
        }
    }

    renderActiveListCard(list) {
        const completedCount = list.items?.filter(item => item.is_checked).length || 0;
        const totalCount = list.items?.length || 0;
        const typeColor = list.list_type === 'zakupy' ? 'neon-pink' : 'neon-blue';
        const sortButton = list.list_type === 'zakupy' ? `
            <button onclick="app.sortList(${list.id})" class="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-md hover:from-purple-600 hover:to-pink-600 transition-all">
                🔄 Sortuj
            </button>
        ` : '';
        
        const clearCompletedButton = completedCount > 0 ? `
            <button onclick="app.clearCompletedItems(${list.id})" class="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-md hover:from-red-600 hover:to-pink-600 transition-all">
                🗑️ Usuń wykonane (${completedCount})
            </button>
        ` : '';

        return `
            <div class="bg-card-bg rounded-lg p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-700 min-h-screen mobile-active-list">
                <!-- Header section -->
                <div class="mb-4 sm:mb-6">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div class="flex-1">
                            <h3 class="text-2xl sm:text-3xl font-bold text-white mb-2">${list.name}</h3>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span class="inline-block px-3 py-1 text-sm rounded-full bg-${typeColor} bg-opacity-20 text-${typeColor} border border-${typeColor} border-opacity-30 w-fit">
                                    ${list.list_type}
                                </span>
                                <div class="text-base text-gray-400">
                                    ${completedCount}/${totalCount} wykonane
                                </div>
                            </div>
                        </div>
                        <!-- Action buttons -->
                        <div class="flex flex-wrap gap-2 sm:gap-3 justify-start sm:justify-end">
                            ${sortButton}
                            ${clearCompletedButton}
                            <button onclick="app.editList(${list.id})" class="px-3 py-2 text-gray-400 hover:text-neon-blue transition-colors text-base mobile-touch-target bg-gray-700 rounded-md">
                                ✏️ Edytuj
                            </button>
                            <button onclick="app.deleteList(${list.id})" class="px-3 py-2 text-gray-400 hover:text-red-400 transition-colors text-base mobile-touch-target bg-gray-700 rounded-md">
                                🗑️ Usuń
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Add item section -->
                <div class="mb-6 sm:mb-8">
                    <div class="flex flex-col sm:flex-row gap-3">
                        <input type="text" id="quick-add-${list.id}" placeholder="Dodaj nowy przedmiot..." 
                               class="flex-1 px-4 py-3 bg-gray-700 text-white text-base sm:text-lg rounded-lg border border-gray-600 focus:border-${typeColor} focus:outline-none"
                               onkeypress="app.handleQuickAdd(event, ${list.id})">
                        <button onclick="app.addItemToList(${list.id})" class="px-4 sm:px-6 py-3 bg-gradient-to-r from-${typeColor} to-${typeColor === 'neon-pink' ? 'neon-blue' : 'neon-pink'} text-white text-base sm:text-lg rounded-lg hover:opacity-80 transition-opacity mobile-touch-target whitespace-nowrap">
                            + Dodaj
                        </button>
                    </div>
                </div>

                <!-- Items list -->
                <div class="space-y-2 sm:space-y-3">
                    ${(list.items || []).map(item => this.renderListItem(item, list.id)).join('')}
                </div>
            </div>
        `;
    }

    renderListCard(list) {
        const completedCount = list.items?.filter(item => item.is_checked).length || 0;
        const totalCount = list.items?.length || 0;
        const typeColor = list.list_type === 'zakupy' ? 'neon-pink' : 'neon-blue';
        const sortButton = list.list_type === 'zakupy' ? `
            <button onclick="app.sortList(${list.id})" class="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-md hover:from-purple-600 hover:to-pink-600 transition-all">
                🔄 Sortuj
            </button>
        ` : '';

        return `
            <div class="bg-card-bg rounded-lg p-6 shadow-xl border border-gray-700 hover:border-${typeColor} transition-all duration-300">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-white mb-1">${list.name}</h3>
                        <span class="inline-block px-2 py-1 text-xs rounded-full bg-${typeColor} bg-opacity-20 text-${typeColor} border border-${typeColor} border-opacity-30">
                            ${list.list_type}
                        </span>
                        <div class="text-sm text-gray-400 mt-2">
                            ${completedCount}/${totalCount} wykonane
                        </div>
                    </div>
                    <div class="flex gap-2">
                        ${sortButton}
                        <button onclick="app.editList(${list.id})" class="text-gray-400 hover:text-neon-blue transition-colors mobile-touch-target min-w-[44px] min-h-[44px] flex items-center justify-center">
                            ✏️
                        </button>
                        <button onclick="app.deleteList(${list.id})" class="text-gray-400 hover:text-red-400 transition-colors mobile-touch-target min-w-[44px] min-h-[44px] flex items-center justify-center">
                            🗑️
                        </button>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="flex gap-2 mb-3">
                        <input type="text" id="quick-add-${list.id}" placeholder="Dodaj nowy przedmiot..." 
                               class="flex-1 px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-${typeColor} focus:outline-none text-sm"
                               onkeypress="app.handleQuickAdd(event, ${list.id})">
                        <button onclick="app.addItemToList(${list.id})" class="px-4 py-2 bg-gradient-to-r from-${typeColor} to-${typeColor === 'neon-pink' ? 'neon-blue' : 'neon-pink'} text-white rounded-md hover:opacity-80 transition-opacity mobile-touch-target">
                            +
                        </button>
                    </div>
                </div>

                <div class="space-y-2">
                    ${(list.items || []).map(item => this.renderListItem(item, list.id)).join('')}
                </div>
            </div>
        `;
    }

    renderListItem(item, listId) {
        const checkedClass = item.is_checked ? 'line-through text-gray-500' : '';
        const checkedIcon = item.is_checked ? '✅' : '⬜';
        const list = this.lists.find(l => l.id === listId);
        const items = list?.items || [];
        const currentIndex = items.findIndex(i => i.id === item.id);
        const isFirst = currentIndex === 0;
        const isLast = currentIndex === items.length - 1;
        
        return `
            <div class="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors draggable-item" 
                 draggable="true" 
                 data-item-id="${item.id}" 
                 data-list-id="${listId}">
                
                <!-- Main content row -->
                <div class="p-4">
                    <div class="flex items-center gap-3">
                        <!-- Checkbox -->
                        <button onclick="app.toggleItem(${item.id}, ${listId})" 
                                class="text-2xl hover:scale-110 transition-transform mobile-touch-target flex-shrink-0">
                            ${checkedIcon}
                        </button>
                        
                        <!-- Item name -->
                        <span class="text-white text-lg ${checkedClass} flex-1 min-w-0 break-words">${item.name}</span>
                        
                        <!-- Quick actions -->
                        <div class="flex gap-2 flex-shrink-0">
                            <button onclick="app.editItem(${item.id}, ${listId})" 
                                    class="p-2 text-gray-400 hover:text-neon-blue hover:bg-gray-700 rounded-lg transition-colors mobile-touch-target"
                                    title="Edytuj">
                                ✏️
                            </button>
                            <button onclick="app.deleteItem(${item.id}, ${listId})" 
                                    class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors mobile-touch-target"
                                    title="Usuń">
                                🗑️
                            </button>
                        </div>
                    </div>
                    
                    <!-- Move controls row -->
                    <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                        <div class="flex items-center gap-2">
                            <div class="drag-handle cursor-grab text-gray-500 hover:text-gray-300 p-1 mobile-touch-target"
                                 title="Przeciągnij aby zmienić kolejność">
                                ⋮⋮
                            </div>
                            <span class="text-xs text-gray-400 hidden sm:inline">Przeciągnij lub użyj strzałek</span>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="app.moveItemUp(${item.id}, ${listId})" 
                                    class="p-2 text-gray-400 hover:text-neon-blue hover:bg-gray-700 rounded transition-all mobile-touch-target ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}" 
                                    ${isFirst ? 'disabled' : ''}
                                    title="W górę">
                                ▲
                            </button>
                            <button onclick="app.moveItemDown(${item.id}, ${listId})" 
                                    class="p-2 text-gray-400 hover:text-neon-blue hover:bg-gray-700 rounded transition-all mobile-touch-target ${isLast ? 'opacity-30 cursor-not-allowed' : ''}" 
                                    ${isLast ? 'disabled' : ''}
                                    title="W dół">
                                ▼
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showEmptyState() {
        document.getElementById('lists-container').innerHTML = '';
        document.getElementById('empty-state').classList.remove('hidden');
    }

    showListModal(list = null) {
        const modal = document.getElementById('list-modal');
        const title = document.getElementById('modal-title');
        const nameInput = document.getElementById('list-name');
        const typeSelect = document.getElementById('list-type');

        if (list) {
            title.textContent = 'Edytuj Listę';
            nameInput.value = list.name;
            typeSelect.value = list.list_type;
            this.currentListId = list.id;
        } else {
            title.textContent = 'Nowa Lista';
            nameInput.value = '';
            typeSelect.value = 'zakupy';
            this.currentListId = null;
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        nameInput.focus();
    }

    hideListModal() {
        const modal = document.getElementById('list-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.currentListId = null;
    }

    showItemModal(item = null, listId) {
        const modal = document.getElementById('item-modal');
        const title = document.getElementById('item-modal-title');
        const nameInput = document.getElementById('item-name');

        if (item) {
            title.textContent = 'Edytuj Przedmiot';
            nameInput.value = item.name;
            this.currentItemId = item.id;
        } else {
            title.textContent = 'Dodaj Przedmiot';
            nameInput.value = '';
            this.currentItemId = null;
        }

        this.currentListId = listId;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        nameInput.focus();
    }

    hideItemModal() {
        const modal = document.getElementById('item-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.currentItemId = null;
        this.currentListId = null;
        document.getElementById('suggestions').classList.add('hidden');
    }

    async handleListSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('list-name').value;
        const list_type = document.getElementById('list-type').value;

        try {
            let response;
            if (this.currentListId) {
                response = await fetch(`${this.apiBaseUrl}/lists/${this.currentListId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, list_type })
                });
            } else {
                response = await fetch(`${this.apiBaseUrl}/lists`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, list_type })
                });
            }

            if (response.ok) {
                this.hideListModal();
                this.loadLists();
            } else {
                console.error('Błąd podczas zapisywania listy');
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    }

    async handleItemSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('item-name').value;

        try {
            let response;
            if (this.currentItemId) {
                response = await fetch(`${this.apiBaseUrl}/items/${this.currentItemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
            } else {
                response = await fetch(`${this.apiBaseUrl}/items?list_id=${this.currentListId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
            }

            if (response.ok) {
                this.hideItemModal();
                this.loadLists();
            } else {
                console.error('Błąd podczas zapisywania przedmiotu');
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    }

    async handleQuickAdd(event, listId) {
        if (event.key === 'Enter') {
            const input = event.target;
            const name = input.value.trim();
            if (name) {
                try {
                    const response = await fetch(`${this.apiBaseUrl}/items?list_id=${listId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name })
                    });

                    if (response.ok) {
                        input.value = '';
                        this.loadLists();
                    }
                } catch (error) {
                    console.error('Błąd podczas dodawania przedmiotu:', error);
                }
            }
        }
    }

    async handleSuggestions(e) {
        const value = e.target.value;
        if (value.length < 2) {
            document.getElementById('suggestions').classList.add('hidden');
            return;
        }

        try {
            const list = this.lists.find(l => l.id === this.currentListId);
            const response = await fetch(`${this.apiBaseUrl}/items/suggestions/${list?.list_type || 'zakupy'}?limit=10`);
            const suggestions = await response.json();
            this.renderSuggestions(suggestions.map(s => s.item_name));
        } catch (error) {
            console.error('Błąd podczas pobierania sugestii:', error);
        }
    }

    renderSuggestions(suggestions) {
        const container = document.getElementById('suggestions');
        if (suggestions.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.innerHTML = suggestions.map(suggestion => `
            <div class="p-2 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0" 
                 onclick="app.selectSuggestion('${suggestion}')">
                ${suggestion}
            </div>
        `).join('');
        container.classList.remove('hidden');
    }

    selectSuggestion(suggestion) {
        document.getElementById('item-name').value = suggestion;
        document.getElementById('suggestions').classList.add('hidden');
    }

    async editList(listId) {
        const list = this.lists.find(l => l.id === listId);
        if (list) {
            this.showListModal(list);
        }
    }

    async deleteList(listId) {
        if (confirm('Czy na pewno chcesz usunąć tę listę?')) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/lists/${listId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.loadLists();
                }
            } catch (error) {
                console.error('Błąd podczas usuwania listy:', error);
            }
        }
    }

    async addItemToList(listId) {
        const input = document.getElementById(`quick-add-${listId}`);
        if (!input) return;
        
        const name = input.value.trim();
        if (!name) {
            alert('Proszę wpisać nazwę przedmiotu');
            input.focus();
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/items?list_id=${listId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (response.ok) {
                input.value = '';
                this.loadLists();
                // Ustaw focus z powrotem na pole input po dodaniu przedmiotu
                setTimeout(() => input.focus(), 100);
            } else {
                console.error('Błąd podczas dodawania przedmiotu');
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    }

    async toggleItem(itemId, listId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/items/${itemId}/check`, {
                method: 'PATCH'
            });

            if (response.ok) {
                this.loadLists();
            }
        } catch (error) {
            console.error('Błąd podczas zmiany statusu przedmiotu:', error);
        }
    }

    async editItem(itemId, listId) {
        const list = this.lists.find(l => l.id === listId);
        const item = list?.items?.find(i => i.id === itemId);
        if (item) {
            this.showItemModal(item, listId);
        }
    }

    async deleteItem(itemId, listId) {
        if (confirm('Czy na pewno chcesz usunąć ten przedmiot?')) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/items/${itemId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.loadLists();
                }
            } catch (error) {
                console.error('Błąd podczas usuwania przedmiotu:', error);
            }
        }
    }

    async sortList(listId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/lists/${listId}/sort`, {
                method: 'POST'
            });

            if (response.ok) {
                this.loadLists();
            } else {
                console.error('Błąd podczas sortowania listy');
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    }

    selectList(listId) {
        this.selectedListId = listId;
        this.renderTabs();
        this.renderActiveList();
        this.expandListToFullPage(); // Expand list to full page
    }

    expandListToFullPage() {
        const mainContainer = document.getElementById('main-container');
        const activeListContainer = document.getElementById('active-list-container');
        
        // Remove max-width constraint and make container full height
        mainContainer.classList.remove('max-w-7xl', 'mx-auto');
        mainContainer.classList.add('w-full', 'min-h-screen');
        
        // Make active list container take full height
        activeListContainer.classList.add('min-h-full');
    }

    collapseListToNormalView() {
        const mainContainer = document.getElementById('main-container');
        const activeListContainer = document.getElementById('active-list-container');
        
        // Restore max-width constraint
        mainContainer.classList.add('max-w-7xl', 'mx-auto');
        mainContainer.classList.remove('w-full', 'min-h-screen');
        
        // Remove full height from active list container
        activeListContainer.classList.remove('min-h-full');
    }

    backToListView() {
        this.selectedListId = null;
        this.collapseListToNormalView();
        this.renderTabs();
        this.renderActiveList();
    }

    initDragAndDrop() {
        let draggedElement = null;
        
        // Add event listeners to document for drag and drop
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('draggable-item')) {
                draggedElement = e.target;
                e.target.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('draggable-item')) {
                e.target.style.opacity = '';
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        document.addEventListener('dragenter', (e) => {
            if (e.target.classList.contains('draggable-item') && draggedElement) {
                e.target.style.borderColor = '#00ffff';
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.classList.contains('draggable-item')) {
                e.target.style.borderColor = '';
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('draggable-item') && draggedElement && draggedElement !== e.target) {
                const draggedItemId = parseInt(draggedElement.dataset.itemId);
                const targetItemId = parseInt(e.target.dataset.itemId);
                const listId = parseInt(e.target.dataset.listId);
                
                this.reorderItems(draggedItemId, targetItemId, listId);
                e.target.style.borderColor = '';
            }
        });
    }

    async moveItemUp(itemId, listId) {
        const list = this.lists.find(l => l.id === listId);
        if (!list || !list.items) return;

        const items = [...list.items];
        const currentIndex = items.findIndex(i => i.id === itemId);
        
        if (currentIndex > 0) {
            // Swap with previous item
            [items[currentIndex], items[currentIndex - 1]] = [items[currentIndex - 1], items[currentIndex]];
            await this.updateItemPositions(items, listId);
        }
    }

    async moveItemDown(itemId, listId) {
        const list = this.lists.find(l => l.id === listId);
        if (!list || !list.items) return;

        const items = [...list.items];
        const currentIndex = items.findIndex(i => i.id === itemId);
        
        if (currentIndex < items.length - 1) {
            // Swap with next item
            [items[currentIndex], items[currentIndex + 1]] = [items[currentIndex + 1], items[currentIndex]];
            await this.updateItemPositions(items, listId);
        }
    }

    async reorderItems(draggedItemId, targetItemId, listId) {
        const list = this.lists.find(l => l.id === listId);
        if (!list || !list.items) return;

        const items = [...list.items];
        const draggedIndex = items.findIndex(i => i.id === draggedItemId);
        const targetIndex = items.findIndex(i => i.id === targetItemId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // Remove dragged item and insert at target position
            const [draggedItem] = items.splice(draggedIndex, 1);
            items.splice(targetIndex, 0, draggedItem);
            
            await this.updateItemPositions(items, listId);
        }
    }

    async updateItemPositions(items, listId) {
        try {
            // Update positions based on array order
            const updates = items.map((item, index) => ({
                id: item.id,
                position: index
            }));

            const response = await fetch(`${this.apiBaseUrl}/lists/${listId}/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: updates })
            });

            if (response.ok) {
                // Update local state
                const list = this.lists.find(l => l.id === listId);
                if (list) {
                    items.forEach((item, index) => {
                        item.position = index;
                    });
                    list.items = items;
                    this.renderActiveList();
                }
            } else {
                console.error('Błąd podczas zmiany kolejności przedmiotów');
                // Reload to get correct order from server
                this.loadLists();
            }
        } catch (error) {
            console.error('Błąd:', error);
            // Reload to get correct order from server
            this.loadLists();
        }
    }

    async clearCompletedItems(listId) {
        if (confirm('Czy na pewno chcesz usunąć wszystkie wykonane przedmioty z listy?')) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/lists/${listId}/clear-completed`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.loadLists();
                } else {
                    console.error('Błąd podczas usuwania wykonanych przedmiotów');
                }
            } catch (error) {
                console.error('Błąd:', error);
            }
        }
    }

    // Convert Text Modal Functions
    showConvertTextModal() {
        const modal = document.getElementById('convert-text-modal');
        const textInput = document.getElementById('convert-text-input');
        const nameInput = document.getElementById('convert-list-name');
        
        textInput.value = '';
        nameInput.value = 'Lista z AI';
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        textInput.focus();
    }

    hideConvertTextModal() {
        const modal = document.getElementById('convert-text-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.resetConvertButton();
    }

    resetConvertButton() {
        const btnText = document.getElementById('convert-btn-text');
        const loading = document.getElementById('convert-loading');
        const submitBtn = document.getElementById('convert-submit-btn');
        
        btnText.textContent = '🤖 Konwertuj';
        loading.classList.add('hidden');
        submitBtn.disabled = false;
    }

    setConvertButtonLoading() {
        const btnText = document.getElementById('convert-btn-text');
        const loading = document.getElementById('convert-loading');
        const submitBtn = document.getElementById('convert-submit-btn');
        
        btnText.textContent = 'Konwertuję...';
        loading.classList.remove('hidden');
        submitBtn.disabled = true;
    }

    async handleConvertTextSubmit(e) {
        e.preventDefault();
        const text = document.getElementById('convert-text-input').value;
        const listName = document.getElementById('convert-list-name').value;

        if (!text.trim()) {
            alert('Proszę wkleić tekst do konwersji');
            return;
        }

        this.setConvertButtonLoading();

        try {
            const groceryItems = await this.convertTextToGroceryList(text);
            
            if (groceryItems && groceryItems.length > 0) {
                await this.createListFromAI(listName, groceryItems);
                this.hideConvertTextModal();
                this.loadLists();
            } else {
                alert('Nie udało się wyodrębnić przedmiotów z tekstu. Spróbuj z innym tekstem.');
                this.resetConvertButton();
            }
        } catch (error) {
            console.error('Błąd podczas konwersji:', error);
            alert('Wystąpił błąd podczas konwersji tekstu. Spróbuj ponownie.');
            this.resetConvertButton();
        }
    }

    async convertTextToGroceryList(text) {
        const prompt = `Przeanalizuj poniższy tekst i wyodrębnij z niego listę przedmiotów do kupienia w sklepie spożywczym. 

Zasady:
1. Zwróć tylko nazwy produktów spożywczych i artykułów gospodarstwa domowego
2. Pomiń narzędzia kuchenne, sprzęt i urządzenia
3. Użyj polskich nazw produktów
4. Każdy przedmiot w nowej linii
5. Nie dodawaj numeracji ani myślników
6. Skup się na składnikach i produktach, które można kupić w sklepie
7. Jeśli tekst nie zawiera przedmiotów spożywczych, zwróć pustą listę

Tekst do analizy:
"${text}"

Odpowiedź (lista produktów, każdy w nowej linii):`;

        // W rzeczywistej aplikacji tutaj byłby call do OpenAI API
        // Na razie symulujemy odpowiedź
        try {
            const response = await this.callOpenAI(prompt);
            
            // Parsuj odpowiedź na listę przedmiotów
            const items = response.split('\n')
                .map(item => item.trim())
                .filter(item => item.length > 0)
                .filter(item => !item.match(/^\d+\.|^-|^\*/)) // usuń numerację i myślniki
                .map(item => item.replace(/^[-*]\s*/, '')) // usuń ewentualne myślniki na początku
                .slice(0, 20); // maksymalnie 20 przedmiotów

            return items;
        } catch (error) {
            console.error('Błąd API OpenAI:', error);
            throw error;
        }
    }

    async callOpenAI(prompt) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/ai/convert-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: prompt
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.items.join('\n');
        } catch (error) {
            console.error('Błąd podczas komunikacji z OpenAI API:', error);
            throw new Error('Nie udało się połączyć z usługą AI. Sprawdź połączenie internetowe i spróbuj ponownie.');
        }
    }

    async createListFromAI(listName, items) {
        try {
            // Najpierw utwórz listę
            const listResponse = await fetch(`${this.apiBaseUrl}/lists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: listName, 
                    list_type: 'zakupy' 
                })
            });

            if (!listResponse.ok) {
                throw new Error('Błąd podczas tworzenia listy');
            }

            const newList = await listResponse.json();

            // Dodaj przedmioty do listy
            for (const itemName of items) {
                try {
                    await fetch(`${this.apiBaseUrl}/items?list_id=${newList.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: itemName })
                    });
                } catch (error) {
                    console.error(`Błąd podczas dodawania przedmiotu ${itemName}:`, error);
                }
            }

            return newList;
        } catch (error) {
            console.error('Błąd podczas tworzenia listy z AI:', error);
            throw error;
        }
    }
}

const app = new GroceryListApp();