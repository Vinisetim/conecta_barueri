document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");

    if (sidebar && sidebarToggle) {
        sidebarToggle.addEventListener("click", function () {
            sidebar.classList.toggle("collapsed");
        });
    }

    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll(".menu-link, .submenu-link");

    sidebarLinks.forEach(function (link) {
        const href = link.getAttribute("href");

        if (href && href !== "#" && href === currentPath) {
            link.classList.add("active");

            const adminParent = document.querySelector(".admin-parent");
            if (currentPath.startsWith("/admin") && adminParent) {
                adminParent.classList.add("active-parent");
            }
        }
    });

    // Toggle do submenu admin
    const adminToggle = document.getElementById("adminToggle");
    const adminSubmenu = document.getElementById("adminSubmenu");
    const adminChevron = document.getElementById("adminChevron");

    if (adminToggle) {
        // Abre automaticamente se estiver em rota /admin
        if (currentPath.startsWith("/admin") && adminSubmenu && adminChevron) {
            adminSubmenu.classList.add("open");
            adminChevron.classList.add("rotated");
            adminToggle.classList.add("active-parent");
        }

        adminToggle.addEventListener("click", function () {
            if (adminSubmenu) adminSubmenu.classList.toggle("open");
            if (adminChevron) adminChevron.classList.toggle("rotated");
        });
    }
});
