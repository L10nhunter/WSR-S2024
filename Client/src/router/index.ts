// noinspection TypeScriptCheckImport
import {createRouter, createWebHistory} from 'vue-router';
import {routes} from 'vue-router/auto-routes';
import {showLoginModal} from "@/model/users";
import {getSession} from "@/model/session";


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
})

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !getSession().user){
        showLoginModal.value = true;
    }
    else {
        next();
    }
})

export default router
