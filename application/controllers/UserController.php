<?php

class UserController extends Zend_Controller_Action
{

    public function init()
    {
        /* Initialize action controller here */
    }

    public function indexAction()
    {
        // action body
    }

    public function listAction()
    {
        $model = new Times_Model_User();
        $users = $model->getUsers();
        $this->view->users = $users;
    }


}



